import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/core/database/database-connection';
import { AuthRepository } from './repositories/auth.repository';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersRepository } from '@/modules/users/users.repository';
import { PasswordsService } from './providers/passwords.service';
import { JwtService } from '@nestjs/jwt';
import { env } from '@/core/config/env.schema';
import { randomUUID } from 'crypto';
import type { DbClient } from '@/core/database/database.provider';
import type {
  User,
  UserWithBusinessUnits,
} from '@/modules/users/types/user.types';
import type { JwtPayload } from './interface/request-with-user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DbClient,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordsService,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Sign In ─────────────────────────────────────────────────
  async signIn({ username, password }: SignInDto) {
    const user = await this.usersRepository.findForLogin(username);

    if (!user) {
      throw new UnauthorizedException('Incorrect username or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated. Contact your administrator.');
    }

    if (!(await this.passwordService.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Incorrect username or password');
    }

    // Single-session: nuke any existing refresh token before issuing a new one
    await this.authRepository.deleteAllUserRefreshTokens(user.id);

    const { accessToken, refreshToken } = await this._issueTokenPair(user);

    return {
      user: this._buildFullUserDto(user),
      accessToken,
      refreshToken,
    };
  }

  // ─── Get Current User Profile ────────────────────────────────
  async getMe(userId: string) {
    const user = await this.usersRepository.findByIdWithBusinessUnits(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this._buildFullUserDto(user);
  }

  // ─── Refresh Token Rotation ──────────────────────────────────
  async refresh(rawRefreshToken: string) {
    // Decode the refresh token to extract the userId
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(
        rawRefreshToken,
        { secret: env.JWT_REFRESH_SECRET },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;
    const storedToken = await this.authRepository.findRefreshTokenByUserId(userId);

    if (!storedToken) {
      throw new UnauthorizedException('No active session found');
    }

    // Check if the stored token has expired
    if (new Date() > storedToken.expiresAt) {
      await this.authRepository.deleteAllUserRefreshTokens(userId);
      throw new UnauthorizedException('Refresh token has expired. Please log in again.');
    }

    // Compare the raw token hash against what we stored
    const isValid = await this.passwordService.compare(
      rawRefreshToken,
      storedToken.tokenHash,
    );

    if (!isValid) {
      // Token reuse detected — potential theft. Revoke everything.
      await this.authRepository.deleteAllUserRefreshTokens(userId);
      throw new UnauthorizedException(
        'Refresh token reuse detected. All sessions have been revoked.',
      );
    }

    // Token is valid — rotate it
    await this.authRepository.deleteRefreshToken(storedToken.id);

    const user = await this.usersRepository.findForLogin(
      (await this.usersRepository.findById(userId))!.username,
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { accessToken, refreshToken } = await this._issueTokenPair(user);

    return {
      user: this._buildFullUserDto(user),
      accessToken,
      refreshToken,
    };
  }

  // ─── Logout ──────────────────────────────────────────────────
  async logout(userId: string) {
    await this.authRepository.deleteAllUserRefreshTokens(userId);
    return { message: 'Successfully logged out' };
  }

  // ─── Self-Service Profile Update ─────────────────────────────
  async updateProfile(
    userId: string,
    dto: { firstName?: string; lastName?: string; phoneNumber?: string },
  ) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updated = await this.usersRepository.update(userId, dto);
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }

  // ─── Self-Service Password Change ────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await this.passwordService.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.usersRepository.updatePasswordHash(userId, newHash);

    // Force re-login everywhere
    await this.authRepository.deleteAllUserRefreshTokens(userId);

    return { message: 'Password changed successfully. Please log in again.' };
  }

  // ─── Admin Password Reset ────────────────────────────────────
  async resetPassword(
    targetUserId: string,
    dto: ResetPasswordDto,
    actingUser: JwtPayload,
    tenantId: string,
  ) {
    // Verify the target user exists
    const targetUser = await this.usersRepository.findByIdWithBusinessUnits(targetUserId);

    if (!targetUser) {
      throw new BadRequestException('Target user not found');
    }

    // Verify the target user belongs to the same business unit
    const targetBelongsToTenant = targetUser.userBusinessUnits.some(
      (ub) => ub.businessUnitId === tenantId,
    );

    if (!targetBelongsToTenant) {
      throw new ForbiddenException(
        'Target user does not belong to this business unit',
      );
    }

    // Prevent resetting your own password through this endpoint
    if (actingUser.sub === targetUserId) {
      throw new BadRequestException(
        'Use the change-password endpoint to change your own password',
      );
    }

    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.usersRepository.updatePasswordHash(targetUserId, newHash);

    // Force the target user to re-login
    await this.authRepository.deleteAllUserRefreshTokens(targetUserId);

    return { message: 'Password has been reset successfully' };
  }

  // ─── Private Helpers ─────────────────────────────────────────

  private async _issueTokenPair(user: UserWithBusinessUnits) {
    const jwtPayload = this._buildJwtPayload(user);

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    // Sign the refresh token with a different secret and longer expiry
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: env.JWT_REFRESH_SECRET,
        expiresIn: env.JWT_REFRESH_EXPIRATION,
      },
    );

    // Hash the refresh token before storing it
    const tokenHash = await this.passwordService.hash(refreshToken);

    // Calculate expiry date for the DB row
    const expiresAt = this._calculateRefreshExpiry();

    await this.authRepository.createRefreshToken(user.id, tokenHash, expiresAt);

    return { accessToken, refreshToken };
  }

  private _calculateRefreshExpiry(): Date {
    const expiration = env.JWT_REFRESH_EXPIRATION;
    const now = new Date();

    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Default to 7 days if parsing fails
      now.setDate(now.getDate() + 7);
      return now;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': now.setSeconds(now.getSeconds() + value); break;
      case 'm': now.setMinutes(now.getMinutes() + value); break;
      case 'h': now.setHours(now.getHours() + value); break;
      case 'd': now.setDate(now.getDate() + value); break;
    }

    return now;
  }

  private _buildSafeUserDto(user: User) {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private _buildFullUserDto(user: UserWithBusinessUnits) {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      businessUnits: user.userBusinessUnits.map((ub) => ({
        businessUnitId: ub.businessUnitId,
        role: ub.role,
        businessUnit: {
          id: ub.businessUnit.id,
          name: ub.businessUnit.name,
          slug: ub.businessUnit.slug,
          type: ub.businessUnit.type,
        },
      })),
    };
  }

  private _buildJwtPayload(user: UserWithBusinessUnits) {
    const businessUnitsAccess = user.userBusinessUnits.map((access) => ({
      businessUnitId: access.businessUnitId,
      role: access.role,
    }));

    return {
      sub: user.id,
      username: user.username,
      businessUnits: businessUnitsAccess,
    };
  }
}

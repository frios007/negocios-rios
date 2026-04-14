import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/core/database/database-connection';
import { type DbClient } from '@/core/database/database.provider';
import { UsersRepository } from './users.repository';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { PasswordsService } from '@/modules/auth/providers/passwords.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type { AssignUserDto } from './dto/assign-user.dto';
import type { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import type { UserRole } from '@/core/database/schemas/core/core.tables';
import type { JwtPayload } from '@/modules/auth/interface/request-with-user.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DbClient,
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly passwordsService: PasswordsService,
  ) {}

  // ─── List Users for Tenant ──────────────────────────────────

  async findAllByTenant(
    tenantId: string,
    pagination: { page: number; limit: number },
  ) {
    const result = await this.usersRepository.findAllByTenant(tenantId, pagination);

    // Strip passwordHash from response
    const items = result.items.map(({ passwordHash, ...rest }) => rest);

    return { items, meta: result.meta };
  }

  // ─── Get User Detail ────────────────────────────────────────

  async findOne(userId: string) {
    const user = await this.usersRepository.findByIdWithBusinessUnits(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUser } = user;

    return {
      ...safeUser,
      businessUnits: user.userBusinessUnits.map((ub) => ({
        businessUnitId: ub.businessUnitId,
        role: ub.role,
        businessUnit: ub.businessUnit,
      })),
    };
  }

  // ─── Create User ───────────────────────────────────────────

  async createUser(
    dto: CreateUserDto,
    tenantId: string,
    actingUser: JwtPayload,
  ) {
    this._enforceRoleHierarchy(actingUser, tenantId, dto.role);

    // Check username uniqueness
    const existing = await this.usersRepository.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    return this.db.transaction(async (tx) => {
      // Create user
      const passwordHash = await this.passwordsService.hash(dto.password);
      const user = await this.usersRepository.create(
        {
          username: dto.username,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phoneNumber: dto.phoneNumber,
          passwordHash,
        },
        tx,
      );

      // Assign to the active tenant with the specified role
      await this.usersRepository.assignToBusinessUnit(
        user.id,
        tenantId,
        dto.role,
        tx,
      );

      const { passwordHash: _, ...safeUser } = user;
      return { ...safeUser, role: dto.role };
    });
  }

  // ─── Update User Profile ───────────────────────────────────

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...updated } = await this.usersRepository.update(
      userId,
      dto,
    );

    return updated;
  }

  // ─── Toggle Active Status ─────────────────────────────────

  async toggleStatus(
    targetUserId: string,
    actingUserId: string,
  ) {
    if (targetUserId === actingUserId) {
      throw new ForbiddenException('You cannot change your own status');
    }

    const user = await this.usersRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newStatus = !user.isActive;

    const { passwordHash, ...updated } = await this.usersRepository.update(
      targetUserId,
      { isActive: newStatus },
    );

    // If deactivating, force logout by deleting refresh tokens
    if (!newStatus) {
      await this.authRepository.deleteAllUserRefreshTokens(targetUserId);
    }

    return updated;
  }

  // ─── Update Role ──────────────────────────────────────────

  async updateRole(
    targetUserId: string,
    tenantId: string,
    dto: UpdateUserRoleDto,
    actingUser: JwtPayload,
  ) {
    if (targetUserId === actingUser.sub) {
      throw new ForbiddenException('You cannot change your own role');
    }

    this._enforceRoleHierarchy(actingUser, tenantId, dto.role);

    const assignment = await this.usersRepository.findUserBusinessUnit(
      targetUserId,
      tenantId,
    );

    if (!assignment) {
      throw new NotFoundException('User is not assigned to this business unit');
    }

    // If changing away from OWNER, check we're not removing the last owner
    if (assignment.role === 'OWNER' && dto.role !== 'OWNER') {
      const ownerCount = await this.usersRepository.countOwnersInBU(tenantId);
      if (ownerCount <= 1) {
        throw new ForbiddenException(
          'Cannot remove the last owner from a business unit',
        );
      }
    }

    return this.usersRepository.updateRole(targetUserId, tenantId, dto.role);
  }

  // ─── Assign to Business Unit ──────────────────────────────

  async assignToBU(
    targetUserId: string,
    dto: AssignUserDto,
    actingUser: JwtPayload,
  ) {
    // Verify acting user has access to the target BU
    const actingAccess = actingUser.businessUnits.find(
      (bu) => bu.businessUnitId === dto.businessUnitId,
    );

    if (!actingAccess) {
      throw new ForbiddenException('You do not have access to the target business unit');
    }

    // Only OWNER can assign to BUs
    if (actingAccess.role !== 'OWNER') {
      throw new ForbiddenException('Only owners can assign users to business units');
    }

    this._enforceRoleHierarchy(actingUser, dto.businessUnitId, dto.role);

    // Check target user exists
    const user = await this.usersRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check not already assigned
    const existing = await this.usersRepository.findUserBusinessUnit(
      targetUserId,
      dto.businessUnitId,
    );
    if (existing) {
      throw new ConflictException('User is already assigned to this business unit');
    }

    return this.usersRepository.assignToBusinessUnit(
      targetUserId,
      dto.businessUnitId,
      dto.role,
    );
  }

  // ─── Unassign from Business Unit ──────────────────────────

  async unassignFromBU(
    targetUserId: string,
    businessUnitId: string,
    actingUser: JwtPayload,
  ) {
    if (targetUserId === actingUser.sub) {
      throw new ForbiddenException('You cannot unassign yourself');
    }

    const assignment = await this.usersRepository.findUserBusinessUnit(
      targetUserId,
      businessUnitId,
    );

    if (!assignment) {
      throw new NotFoundException('User is not assigned to this business unit');
    }

    // If unassigning an OWNER, check we're not removing the last one
    if (assignment.role === 'OWNER') {
      const ownerCount = await this.usersRepository.countOwnersInBU(businessUnitId);
      if (ownerCount <= 1) {
        throw new ForbiddenException(
          'Cannot remove the last owner from a business unit',
        );
      }
    }

    await this.usersRepository.unassignFromBusinessUnit(
      targetUserId,
      businessUnitId,
    );

    return { message: 'User unassigned successfully' };
  }

  // ─── Reset Password ──────────────────────────────────────

  async resetPassword(targetUserId: string, dto: ResetUserPasswordDto) {
    const user = await this.usersRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await this.passwordsService.hash(dto.newPassword);
    await this.usersRepository.updatePasswordHash(targetUserId, passwordHash);

    // Force re-login by deleting refresh tokens
    await this.authRepository.deleteAllUserRefreshTokens(targetUserId);

    return { message: 'Password reset successfully' };
  }

  // ─── Private Helpers ──────────────────────────────────────

  /**
   * ADMIN cannot assign/create OWNER roles.
   * OWNER can assign any role.
   */
  private _enforceRoleHierarchy(
    actingUser: JwtPayload,
    tenantId: string,
    targetRole: UserRole,
  ) {
    const actingAccess = actingUser.businessUnits.find(
      (bu) => bu.businessUnitId === tenantId,
    );

    if (!actingAccess) {
      throw new ForbiddenException('You do not have access to this business unit');
    }

    if (actingAccess.role === 'ADMIN' && targetRole === 'OWNER') {
      throw new ForbiddenException(
        'Admins cannot assign the Owner role. Only owners can do this.',
      );
    }
  }
}

import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Res,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { Public } from "./decorators/auth.decorator";
import { SkipTenantGuard } from "@/core/decorators/skip-tenant.decorator";
import { Roles } from "@/core/decorators/roles.decorator";
import { ResponseMessage } from "@/core/decorators/response-message.decorator";
import { CurrentUser } from "@/core/decorators/user.decorator";
import { ActiveTenant } from "@/core/decorators/tenant.decorator";
import { env } from "@/core/config/env.schema";

const REFRESH_TOKEN_COOKIE = "refresh_token";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("User logged in successfully")
  @Post("signin")
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const { refreshToken, ...result } =
      await this.authService.signIn(signInDto);
    this._setRefreshTokenCookie(res, refreshToken);
    return result;
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Token refreshed successfully")
  @Post("refresh")
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!rawToken) {
      throw new UnauthorizedException("No refresh token provided");
    }

    const { refreshToken, ...result } =
      await this.authService.refresh(rawToken);
    this._setRefreshTokenCookie(res, refreshToken);
    return result;
  }

  @SkipTenantGuard()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("User profile retrieved successfully")
  @Get("me")
  async getMe(@CurrentUser() userId: string) {
    return this.authService.getMe(userId);
  }

  @SkipTenantGuard()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Profile updated successfully")
  @Patch("profile")
  async updateProfile(
    @CurrentUser() userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @SkipTenantGuard()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Logged out successfully")
  @Post("logout")
  async logout(
    @CurrentUser() userId: string,
    @Res({ passthrough: true }) res: any,
  ) {
    this._clearRefreshTokenCookie(res);
    return this.authService.logout(userId);
  }

  @SkipTenantGuard()
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Password changed successfully")
  @Patch("change-password")
  async changePassword(
    @CurrentUser() userId: string,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: any,
  ) {
    this._clearRefreshTokenCookie(res);
    return this.authService.changePassword(userId, dto);
  }

  @Roles("OWNER", "ADMIN")
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Password reset successfully")
  @Patch("reset-password/:userId")
  async resetPassword(
    @Param("userId") targetUserId: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser("full") actingUser: any,
    @ActiveTenant() tenantId: string,
  ) {
    return this.authService.resetPassword(
      targetUserId,
      dto,
      actingUser,
      tenantId,
    );
  }

  // ─── Cookie Helpers ────────────────────────────────────────────

  private _setRefreshTokenCookie(res: Response, token: string) {
    const maxAgeMs = this._parseExpirationToMs(env.JWT_REFRESH_EXPIRATION);

    res.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "strict",
      path: "/api/v1/auth",
      maxAge: maxAgeMs,
    });
  }

  private _clearRefreshTokenCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "strict",
      path: "/api/v1/auth",
    });
  }

  private _parseExpirationToMs(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}

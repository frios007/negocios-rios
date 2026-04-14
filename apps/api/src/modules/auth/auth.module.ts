import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { UsersModule } from '@/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { env } from '@/core/config/env.schema';
import { PasswordsService } from './providers/passwords.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, PasswordsService],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: env.JWT_ACCESS_EXPIRATION },
    }),
  ],
})
export class AuthModule {}

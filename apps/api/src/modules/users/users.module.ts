import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { PasswordsService } from '@/modules/auth/providers/passwords.service';

@Module({
  providers: [UsersService, UsersRepository, AuthRepository, PasswordsService],
  controllers: [UsersController],
  exports: [UsersRepository],
})
export class UsersModule {}

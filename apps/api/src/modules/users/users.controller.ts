import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { Roles } from '@/core/decorators/roles.decorator';
import { CurrentUser } from '@/core/decorators/user.decorator';
import { ActiveTenant } from '@/core/decorators/tenant.decorator';
import { ResponseMessage } from '@/core/decorators/response-message.decorator';
import { PaginationDto } from '@/core/dto/pagination.dto';
import type { JwtPayload } from '@/modules/auth/interface/request-with-user.interface';

@Controller('users')
@Roles('OWNER', 'ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ResponseMessage('Users retrieved successfully')
  async findAll(
    @ActiveTenant() tenantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.findAllByTenant(tenantId, pagination);
  }

  @Get(':id')
  @ResponseMessage('User retrieved successfully')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ResponseMessage('User created successfully')
  async create(
    @Body() dto: CreateUserDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser('full') actingUser: JwtPayload,
  ) {
    return this.usersService.createUser(dto, tenantId, actingUser);
  }

  @Patch(':id')
  @ResponseMessage('User updated successfully')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Patch(':id/toggle-status')
  @ResponseMessage('User status updated successfully')
  async toggleStatus(
    @Param('id') id: string,
    @CurrentUser() actingUserId: string,
  ) {
    return this.usersService.toggleStatus(id, actingUserId);
  }

  @Patch(':id/role')
  @ResponseMessage('User role updated successfully')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @ActiveTenant() tenantId: string,
    @CurrentUser('full') actingUser: JwtPayload,
  ) {
    return this.usersService.updateRole(id, tenantId, dto, actingUser);
  }

  @Post(':id/assign')
  @ResponseMessage('User assigned to business unit successfully')
  async assignToBU(
    @Param('id') id: string,
    @Body() dto: AssignUserDto,
    @CurrentUser('full') actingUser: JwtPayload,
  ) {
    return this.usersService.assignToBU(id, dto, actingUser);
  }

  @Delete(':id/unassign/:buId')
  @ResponseMessage('User unassigned from business unit successfully')
  async unassignFromBU(
    @Param('id') userId: string,
    @Param('buId') buId: string,
    @CurrentUser('full') actingUser: JwtPayload,
  ) {
    return this.usersService.unassignFromBU(userId, buId, actingUser);
  }

  @Patch(':id/reset-password')
  @ResponseMessage('Password reset successfully')
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetUserPasswordDto,
  ) {
    return this.usersService.resetPassword(id, dto);
  }
}

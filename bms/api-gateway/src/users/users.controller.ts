import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(@Query('companyId') companyId: string) {
    return this.usersService.findAll(companyId);
  }

  @Get('stats')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'User statistics' })
  async getStatistics(@Query('companyId') companyId: string) {
    return this.usersService.getStatistics(companyId);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'User details' })
  async findOne(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(companyId, id);
  }

  @Post()
  @RequirePermissions('users:write')
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(
    @CompanyId() companyId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(companyId, createUserDto);
  }

  @Put(':id')
  @RequirePermissions('users:write')
  @ApiOperation({ summary: 'Update user' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(companyId, id, updateUserDto);
  }

  @Post(':id/change-password')
  @RequirePermissions('users:write')
  @ApiOperation({ summary: 'Change user password' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'Password changed' })
  async changePassword(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(companyId, id, changePasswordDto);
    return { success: true, message: 'Password changed successfully' };
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async delete(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.usersService.delete(companyId, id);
    return { success: true, message: 'User deleted successfully' };
  }

  @Delete(':id/hard')
  @RequirePermissions('users:delete')
  @ApiOperation({ summary: 'Permanently delete user' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'User permanently deleted' })
  async hardDelete(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    await this.usersService.hardDelete(companyId, id);
    return { success: true, message: 'User permanently deleted' };
  }
}

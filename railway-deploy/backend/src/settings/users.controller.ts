import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, UserRole } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Profiles } from '../auth/decorators/profile.decorator';
import { UserProfile } from '../auth/guards/user-profiles';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

@ApiTags('Settings - Users')
@Controller('settings/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Profiles(UserProfile.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users for a company' })
  @ApiQuery({ name: 'companyId', required: true, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [UserResponseDto] })
  async getUsers(@Query('companyId') companyId: string) {
    return this.usersService.getUsersByCompany(companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id') id: string,
    @Query('companyId') companyId: string
  ) {
    return this.usersService.deleteUser(id, companyId);
  }

  @Post(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active/inactive status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully', type: UserResponseDto })
  async toggleUserStatus(@Param('id') id: string) {
    return this.usersService.toggleUserStatus(id);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user statistics for a company' })
  @ApiQuery({ name: 'companyId', required: true, description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getUserStatistics(@Query('companyId') companyId: string) {
    return this.usersService.getUserStatistics(companyId);
  }
}

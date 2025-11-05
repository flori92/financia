import { Injectable, NotFoundException, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(companyId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { companyId },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'avatar', 'role', 'isActive', 'emailVerified', 'lastLogin', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, companyId },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'avatar', 'role', 'isActive', 'emailVerified', 'lastLogin', 'permissions', 'preferences', 'twoFactorEnabled', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'companyId', 'role', 'isActive', 'twoFactorEnabled', 'twoFactorSecret'],
    });
  }

  async create(companyId: string, createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      companyId,
      password: hashedPassword,
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
      role: createUserDto.role || 'user',
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);
    
    this.logger.log(`User created: ${savedUser.email} (${savedUser.id})`);
    
    // Remove password from response
    delete savedUser.password;
    
    return savedUser;
  }

  async update(companyId: string, id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(companyId, id);

    // If email is being updated, check for conflicts
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);
    
    this.logger.log(`User updated: ${updatedUser.email} (${updatedUser.id})`);
    
    // Remove password from response
    delete updatedUser.password;
    
    return updatedUser;
  }

  async changePassword(companyId: string, userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, companyId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.userRepository.update(userId, { password: hashedPassword });
    
    this.logger.log(`Password changed for user: ${userId}`);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const user = await this.findOne(companyId, id);

    // Soft delete
    user.isActive = false;
    await this.userRepository.save(user);
    
    this.logger.log(`User soft deleted: ${user.email} (${user.id})`);
  }

  async hardDelete(companyId: string, id: string): Promise<void> {
    const user = await this.findOne(companyId, id);
    
    await this.userRepository.remove(user);
    
    this.logger.log(`User hard deleted: ${user.email} (${user.id})`);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLogin: new Date() });
  }

  async getStatistics(companyId: string): Promise<any> {
    const users = await this.findAll(companyId);
    
    const active = users.filter(u => u.isActive).length;
    const inactive = users.filter(u => !u.isActive).length;
    const verified = users.filter(u => u.emailVerified).length;
    
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: users.length,
      active,
      inactive,
      verified,
      unverified: users.length - verified,
      roleDistribution,
    };
  }
}

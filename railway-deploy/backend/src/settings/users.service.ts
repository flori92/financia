import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getUsersByCompany(companyId: string) {
    const users = await this.usersRepository.find({
      where: { companyId },
      select: ['id', 'name', 'email', 'role', 'status', 'createdAt', 'lastLogin'],
      order: { createdAt: 'DESC' }
    });

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    return {
      users,
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password || 'defaultPassword123', 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    });

    const savedUser = await this.usersRepository.save(user);

    // Retourner sans le mot de passe
    const { password, ...result } = savedUser;
    return result;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Si un nouveau mot de passe est fourni, le hasher
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.update(id, updateUserDto);

    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    
    // Retourner sans le mot de passe
    const { password, ...result } = updatedUser;
    return result;
  }

  async deleteUser(id: string, companyId: string) {
    const user = await this.usersRepository.findOne({ where: { id, companyId } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.usersRepository.remove(user);
    return { message: 'Utilisateur supprimé avec succès' };
  }

  async toggleUserStatus(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await this.usersRepository.update(id, { status: newStatus });

    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    
    // Retourner sans le mot de passe
    const { password, ...result } = updatedUser;
    return result;
  }

  async getUserStatistics(companyId: string) {
    const users = await this.usersRepository.find({
      where: { companyId }
    });

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const inactiveUsers = totalUsers - activeUsers;
    
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const recentLogins = users
      .filter(u => u.lastLogin)
      .sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
      .slice(0, 5);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleStats,
      recentLogins
    };
  }
}

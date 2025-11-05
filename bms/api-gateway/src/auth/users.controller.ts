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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

/**
 * Contrôleur pour la gestion des utilisateurs
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les utilisateurs d\'une société' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs',
    type: [User],
  })
  async getUsers(@Query('companyId') companyId: string) {
    return this.usersRepo.find({
      where: { companyId },
      relations: ['roles', 'company'],
      select: [
        'id',
        'email',
        'phone',
        'firstName',
        'lastName',
        'isActive',
        'emailVerified',
        'phoneVerified',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
        'uxLevel',
        'language',
        'countryCode',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'utilisateur' })
  async getUser(@Param('id') id: string) {
    return this.usersRepo.findOne({
      where: { id },
      relations: ['roles', 'company'],
      select: [
        'id',
        'email',
        'phone',
        'firstName',
        'lastName',
        'isActive',
        'emailVerified',
        'phoneVerified',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
        'uxLevel',
        'language',
        'countryCode',
        'twoFactorEnabled',
      ],
    });
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  async createUser(
    @Body()
    userData: {
      email: string;
      phone?: string;
      password: string;
      firstName?: string;
      lastName?: string;
      companyId: string;
      role?: string;
      uxLevel?: 'simple' | 'intermediate' | 'expert';
      language?: string;
      countryCode?: string;
    },
  ) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepo.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const user = this.usersRepo.create({
      ...userData,
      role: userData.role || 'user',
      uxLevel: userData.uxLevel || 'simple',
      language: userData.language || 'fr',
      countryCode: userData.countryCode || 'BJ',
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
    });

    const savedUser = await this.usersRepo.save(user);

    // Ne pas retourner le mot de passe
    const { password, ...result } = savedUser;
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
  })
  async updateUser(
    @Param('id') id: string,
    @Body()
    updateData: {
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      isActive?: boolean;
      uxLevel?: 'simple' | 'intermediate' | 'expert';
      language?: string;
      countryCode?: string;
    },
  ) {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si l'email change, vérifier qu'il n'existe pas déjà
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.usersRepo.findOne({
        where: { email: updateData.email },
      });
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
    }

    await this.usersRepo.update(id, updateData);

    return this.usersRepo.findOne({
      where: { id },
      relations: ['roles', 'company'],
      select: [
        'id',
        'email',
        'phone',
        'firstName',
        'lastName',
        'isActive',
        'emailVerified',
        'phoneVerified',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
        'uxLevel',
        'language',
        'countryCode',
      ],
    });
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Changer le mot de passe d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Mot de passe mis à jour' })
  async changePassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    await this.usersRepo.update(id, { password: hashedPassword });
    return { success: true, message: 'Mot de passe mis à jour' };
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur activé' })
  async activateUser(@Param('id') id: string) {
    await this.usersRepo.update(id, { isActive: true });
    return { success: true, message: 'Utilisateur activé' };
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Désactiver un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur désactivé' })
  async deactivateUser(@Param('id') id: string) {
    await this.usersRepo.update(id, { isActive: false });
    return { success: true, message: 'Utilisateur désactivé' };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un utilisateur (soft delete - désactivation)',
  })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  async deleteUser(@Param('id') id: string) {
    // Soft delete - on désactive plutôt que supprimer
    await this.usersRepo.update(id, { isActive: false });
    return { success: true, message: 'Utilisateur désactivé' };
  }
}

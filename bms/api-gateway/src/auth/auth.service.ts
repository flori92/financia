import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({
      where: [{ email: registerDto.email }, { phone: registerDto.phone }],
    });

    if (existingUser) {
      throw new ConflictException('Cet email ou téléphone est déjà utilisé');
    }

    // Créer l'utilisateur (le mot de passe sera hashé automatiquement)
    const user = this.userRepository.create({
      ...registerDto,
      uxLevel: registerDto.uxLevel || 'simple',
      countryCode: registerDto.countryCode || 'BJ',
    });

    const savedUser = await this.userRepository.save(user);

    // Générer les tokens
    const tokens = await this.generateTokens(savedUser);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = savedUser;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await user.validatePassword(password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    // Mettre à jour lastLoginAt
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        uxLevel: user.uxLevel,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }

  private async generateTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      uxLevel: user.uxLevel,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your-super-secret-jwt-key'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,              // ✅ id (pas userId)
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,  // ✅ AJOUTER companyId
      profile: payload.profile,      // ✅ AJOUTER profile
    };
  }
}

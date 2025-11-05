import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PROFILE_KEY } from '../decorators/profile.decorator';
import { UserProfile, getModulesByRole } from './user-profiles';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredProfiles = this.reflector.getAllAndOverride<UserProfile[]>(PROFILE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredProfiles || requiredProfiles.length === 0) {
      return true; // Pas de profil requis, accès autorisé
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // ✅ LOGIQUE CORRECTE - Vérifier le profil principal de l'utilisateur
    console.log(`[ProfileGuard] Vérification profil - user:`, user);
    console.log(`[ProfileGuard] Profils requis:`, requiredProfiles);
    console.log(`[ProfileGuard] Profil utilisateur:`, user.primaryProfile);
    const hasProfile = requiredProfiles.includes(user.primaryProfile);

    if (!hasProfile) {
      console.log(`[ProfileGuard] Accès refusé - profils requis: ${requiredProfiles.join(', ')}, profil utilisateur: ${user.primaryProfile || 'aucun'}`);
      throw new ForbiddenException(
        `Accès refusé. Profils requis: ${requiredProfiles.join(', ')}. Votre profil: ${user.primaryProfile || 'aucun'}`,
      );
    }

    return true;
  }
}

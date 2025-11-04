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

    // Vérifier si l'utilisateur a un des profils requis
    const hasProfile = requiredProfiles.some((profile) => {
      // Vérifier le profil principal de l'utilisateur
      if (user.profile === profile) return true;
      
      // Vérifier les modules autorisés pour le rôle de l'utilisateur
      const userModules = getModulesByRole(user.role);
      const profileModules = requiredProfiles.flatMap(p => 
        p === UserProfile.ADMIN ? ['*'] : [] // Admin a accès à tout
      );
      
      return profileModules.includes('*') || 
             profileModules.some(module => userModules.includes(module));
    });

    if (!hasProfile) {
      throw new ForbiddenException(
        `Accès refusé. Profils requis: ${requiredProfiles.join(', ')}. Votre profil: ${user.profile || 'aucun'}`,
      );
    }

    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CompanyAuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const companyId = request.params.companyId;

        if (!user || !user.companies) {
            return false;
        }

        // Vérifier si l'utilisateur a accès à cette entreprise
        return user.companies.some(company => company.id === companyId);
    }
}
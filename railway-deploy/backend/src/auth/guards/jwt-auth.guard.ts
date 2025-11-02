import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Always allow OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      return true;
    }

    // Call the parent canActivate method for all other requests
    return super.canActivate(context);
  }
}

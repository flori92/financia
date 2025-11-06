import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Récupère l'utilisateur injecté par le JwtAuthGuard.
 * @example
 *   @GetUser() user: AuthenticatedUser
 *   @GetUser('userId') userId: string
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!data) {
      return user;
    }

    return user ? user[data] : undefined;
  },
);

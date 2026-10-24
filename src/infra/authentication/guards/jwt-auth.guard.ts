
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { TOKEN_INSPECTOR } from '../../../core/authentication/authentication.types.js';
import type {
  AuthenticatedToken,
  TokenInspector,
} from '../../../core/authentication/authentication.types.js';

import { CACHE_PROVIDER } from '../../../core/chaching/cache.types.js';
import type { CacheProvider } from '../../../core/chaching/cache.types.js';

export type AuthenticatedRequest = Request & {
  authToken: AuthenticatedToken;
  user: AuthenticatedToken['user'];
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_INSPECTOR)
    private readonly tokenInspector: TokenInspector,

    @Inject(CACHE_PROVIDER)
    private readonly cache: CacheProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token is required');
    }
    const authenticatedToken =
      await this.tokenInspector.inspectToken(token);


    if (!authenticatedToken) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    try {
      const revoked = await this.cache.get<boolean>(
        `revoked-token:${authenticatedToken.jti}`,
      );

      if (revoked === true) {
        throw new UnauthorizedException('Token has been revoked');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Authentication service is temporarily unavailable',
      );
    }

    request.authToken = authenticatedToken;
    request.user = authenticatedToken.user;

    return true;
  }
}

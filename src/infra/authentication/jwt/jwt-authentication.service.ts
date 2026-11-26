
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type {
  AuthenticatedUser,
  AuthenticatedToken,
  TokenIssuer,
  AuthenticationProvider,
  TokenInspector,
  RefreshTokenIssuer,
  RefreshTokenInspector,
  AuthenticatedRefreshToken,
  IssuedRefreshToken
} from '../../../core/authentication/authentication.types.js';

@Injectable()
export class JwtAuthenticationService
  implements
    AuthenticationProvider,
    TokenIssuer,
    TokenInspector,
    RefreshTokenIssuer,
    RefreshTokenInspector
{
  private readonly refreshSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 bytes long');
    }

    this.refreshSecret = secret;
  }

  async issueAccessToken(user: AuthenticatedUser): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      jti: randomUUID(),
      type: 'access',
    });
  }

  async authenticate(token: string): Promise<AuthenticatedUser | null> {
    const result = await this.inspectToken(token);
    return result?.user ?? null;
  }

  async inspectToken(token: string): Promise<AuthenticatedToken | null> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        role: string;
        jti: string;
        type: string;
        exp: number;
      }>(token);

      if (
        !Number.isInteger(payload.sub) ||
        typeof payload.role !== 'string' ||
        typeof payload.jti !== 'string' ||
        payload.type !== 'access' ||
        typeof payload.exp !== 'number' ||
        !Number.isFinite(payload.exp)
      ) {
        return null;
      }

      return {
        user: { id: payload.sub, role: payload.role },
        jti: payload.jti,
        expiresAt: payload.exp * 1000,
      };
    } catch {
      return null;
    }
  }

 async issueRefreshToken(
  user: AuthenticatedUser,
  sessionId: string,
): Promise<IssuedRefreshToken> {
  const jti = randomUUID();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const token = await this.jwtService.signAsync(
    {
      sub: user.id,
      role: user.role,
      jti,
      sid: sessionId,
      type: 'refresh',
    },
    {
      secret: this.refreshSecret,
      expiresIn: '7d',
    },
  );

  return {
    token,
    jti,
    expiresAt,
  };
}

  async inspectRefreshToken(
    token: string,
  ): Promise<AuthenticatedRefreshToken | null> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        role: string;
        jti: string;
        sid: string;
        type: string;
        exp: number;
      }>(token, {
        secret: this.refreshSecret,
      });

      if (
        !Number.isInteger(payload.sub) ||
        typeof payload.role !== 'string' ||
        typeof payload.jti !== 'string' ||
        typeof payload.sid !== 'string' ||
        payload.type !== 'refresh' ||
        typeof payload.exp !== 'number' ||
        !Number.isFinite(payload.exp)
      ) {
        return null;
      }

      return {
        user: { id: payload.sub, role: payload.role },
        jti: payload.jti,
        sessionId: payload.sid,
        expiresAt: payload.exp * 1000,
      };
    } catch {
      return null;
    }
  }
}

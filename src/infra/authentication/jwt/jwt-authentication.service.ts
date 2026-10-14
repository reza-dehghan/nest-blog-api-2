import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type {
  AuthenticatedUser,
  AuthenticatedToken,
  TokenIssuer,
  AuthenticationProvider,
  TokenInspector,
} from '../../../core/authentication/authentication.types.js';

@Injectable()
export class JwtAuthenticationService implements AuthenticationProvider, TokenIssuer,TokenInspector {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async issueAccessToken(
    user: AuthenticatedUser,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      jti: randomUUID(),
    });
  }


async authenticate(
  token: string,
): Promise<AuthenticatedUser | null> {
  const result = await this.inspectToken(token);
  return result?.user ?? null;
}

async inspectToken(
  token: string,
): Promise<AuthenticatedToken | null> {
  try {
    const payload = await this.jwtService.verifyAsync<{
      sub: number;
      role: string;
      jti: string;
      exp: number;
    }>(token);

    if (
      !Number.isInteger(payload.sub) ||
      typeof payload.role !== 'string' ||
      typeof payload.jti !== 'string' ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp)
    ) {
      return null;
    }

    return {
      user: {
        id: payload.sub,
        role: payload.role,
      },
      jti: payload.jti,
      expiresAt: payload.exp * 1000,
    };
  } catch {
    return null;
  }
}
}

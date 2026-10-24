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

  /**
   * create a new access token for user.
   * @param user .
   * @returns new access token(jwt) .
   */
  async issueAccessToken(
    user: AuthenticatedUser,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      jti: randomUUID(),
    });
  }


  /**
   * checks the token and returns the user information
   * 
   * @param token the access token 
   * @returns user information or null
   */
async authenticate(
  token: string,
): Promise<AuthenticatedUser | null> {
  const result = await this.inspectToken(token);
  return result?.user ?? null;
}


/**
 * checks the token and  returns itd information 
 * 
 * @param token -the access token to check 
 * @returns the token information or null  if invalid
 */
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

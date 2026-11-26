import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';

import bcrypt from 'bcrypt';

import { randomUUID } from 'node:crypto';

import { UsersService } from '../users/users.service.js';

import {
  TOKEN_ISSUER,
  TOKEN_INSPECTOR,
  REFRESH_TOKEN_ISSUER,
  REFRESH_TOKEN_INSPECTOR,
} from '../../core/authentication/authentication.types.js';

import type {
  TokenIssuer,
  TokenInspector,
  RefreshTokenIssuer,
  RefreshTokenSession,
  AuthenticatedRefreshToken,
  RefreshTokenInspector,
} from '../../core/authentication/authentication.types.js';

import { CACHE_PROVIDER } from '../../core/chaching/cache.types.js';
import type { CacheProvider } from '../../core/chaching/cache.types.js';

import { RequestContextService } from '../../core/request-context/request-context.service.js';

import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,

    @Inject(TOKEN_ISSUER)
    private readonly tokenIssuer: TokenIssuer,

    @Inject(CACHE_PROVIDER)
    private readonly cache: CacheProvider,

    @Inject(TOKEN_INSPECTOR)
    private readonly tokenInspector: TokenInspector,

    private readonly requestContext: RequestContextService,

    @Inject(REFRESH_TOKEN_ISSUER)
    private readonly refreshTokenIssuer: RefreshTokenIssuer,

    @Inject(REFRESH_TOKEN_INSPECTOR)
    private readonly refreshTokenInspector: RefreshTokenInspector,
  ) {}

  /**
   * Creates a new user account.
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Checks user credentials and creates an access token.
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      this.logger.warn('Login failed', {
        event: 'LOGIN',
        outcome: 'FAILURE',
        requestId: this.requestContext.getRequestId(),
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn('Login failed', {
        event: 'LOGIN',
        outcome: 'FAILURE',
        requestId: this.requestContext.getRequestId(),
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    const authenticatedUser = {
      id: user.id,
      role: user.role,
    };

    const accessToken =
      await this.tokenIssuer.issueAccessToken(authenticatedUser);

    const sessionId = randomUUID();

    const refreshToken = await this.refreshTokenIssuer.issueRefreshToken(
      authenticatedUser,
      sessionId,
    );

    await this.createRefreshSession(
      user.id,
      refreshToken.jti,
      refreshToken.expiresAt,
      sessionId,
    );

    this.logger.log('Login successful', {
      event: 'LOGIN',
      outcome: 'SUCCESS',
      actorId: user.id,
      requestId: this.requestContext.getRequestId(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
    };
  }

  /**
   * a
   * @param refreshToken
   * @returns access token & refreshtoken
   */
  async refreshAccessToken(refreshToken: string) {
    const authenticatedRefreshToken =
      await this.refreshTokenInspector.inspectRefreshToken(refreshToken);

    if (!authenticatedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.validateRefreshSession(authenticatedRefreshToken);

    const accessToken = await this.tokenIssuer.issueAccessToken(
      authenticatedRefreshToken.user,
    );

    const rotatedRefreshToken = await this.rotateRefreshSession(
      authenticatedRefreshToken,
    );

    return {
      access_token: accessToken,
      refresh_token: rotatedRefreshToken.token,
    };
  }

  /**
   * Revokes the current access token until it expires.
   */
  async logout(jti: string, expiresAt: number, refreshToken?: string) {
    const ttl = expiresAt - Date.now();

    if (!jti || !Number.isFinite(ttl) || ttl <= 0) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await this.cache.set(`revoked-token:${jti}`, true, ttl);

    if (refreshToken) {
      const authenticatedRefreshToken =
        await this.refreshTokenInspector.inspectRefreshToken(refreshToken);
      if (authenticatedRefreshToken) {
        await this.deleteRefreshSession(authenticatedRefreshToken.sessionId);
      }
    }

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Changes the user's password.
   */
  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('invalid user');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('current password id incorrect');
    }

    const hashPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.usersService.updatePassword(user.id, hashPassword);

    return {
      message: 'Password changed successfully',
    };
  }
  // ---------------------------------------REFRESH_TOKEN-IN REDIS-------------------------------
  private async createRefreshSession(
    userId: number,
    currentJti: string,
    expiresAt: number,
    sessionId: string,
  ): Promise<void> {
    const session: RefreshTokenSession = {
      userId,
      currentJti,
      expiresAt,
    };

    const ttl = expiresAt - Date.now();

    if (ttl <= 0) {
      throw new UnauthorizedException('Invalid refresh token expiry');
    }

    await this.cache.set(`refresh-session:${sessionId}`, session, ttl);
  }

  private async validateRefreshSession(
    refreshToken: AuthenticatedRefreshToken,
  ): Promise<RefreshTokenSession> {
    const session = await this.getRefreshSession(refreshToken.sessionId);

    if (!session) {
      throw new UnauthorizedException('Refresh session not found');
    }

    const now = Date.now();

    if (
      !Number.isFinite(refreshToken.expiresAt) ||
      refreshToken.expiresAt <= now ||
      !Number.isFinite(session.expiresAt) ||
      session.expiresAt <= now
    ) {
      throw new UnauthorizedException('Refresh session expired');
    }

    if (
      session.userId !== refreshToken.user.id ||
      session.currentJti !== refreshToken.jti
    ) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    return session;
  }

  private async rotateRefreshSession(
    refreshToken: AuthenticatedRefreshToken,
  ): Promise<{ token: string; jti: string; expiresAt: number }> {
    await this.validateRefreshSession(refreshToken);

    const issuedRefreshToken = await this.refreshTokenIssuer.issueRefreshToken(
      refreshToken.user,
      refreshToken.sessionId,
    );

    await this.createRefreshSession(
      refreshToken.user.id,
      issuedRefreshToken.jti,
      issuedRefreshToken.expiresAt,
      refreshToken.sessionId,
    );

    return issuedRefreshToken;
  }

  private async getRefreshSession(
    sessionId: string,
  ): Promise<RefreshTokenSession | null> {
    return this.cache.get<RefreshTokenSession>(`refresh-session:${sessionId}`);
  }

  private async deleteRefreshSession(sessionId: string): Promise<void> {
    await this.cache.delete(`refresh-session:${sessionId}`);
  }
}

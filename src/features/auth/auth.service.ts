
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';

import bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service.js';

import {
  TOKEN_ISSUER,
  TOKEN_INSPECTOR,
} from '../../core/authentication/authentication.types.js';

import type {
  TokenIssuer,
  TokenInspector,
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
  ) {}

  /**
   * Creates a new user account.
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(
      dto.email,
    );

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

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn('Login failed', {
        event: 'LOGIN',
        outcome: 'FAILURE',
        requestId: this.requestContext.getRequestId(),
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.tokenIssuer.issueAccessToken({
      id: user.id,
      role: user.role,
    });

    this.logger.log('Login successful', {
      event: 'LOGIN',
      outcome: 'SUCCESS',
      actorId: user.id,
      requestId: this.requestContext.getRequestId(),
    });

    return {
      access_token: accessToken,
    };
  }

  /**
   * Revokes the current access token until it expires.
   */
  async logout(jti: string, expiresAt: number) {
    const ttl = expiresAt - Date.now();

    if (!jti || !Number.isFinite(ttl) || ttl <= 0) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await this.cache.set(`revoked-token:${jti}`, true, ttl);

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
}

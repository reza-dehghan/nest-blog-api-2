
import {ConflictException,Injectable,UnauthorizedException,} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import {TOKEN_ISSUER,} from '../../core/authentication/authentication.types.js';
import type {TokenIssuer,} from '../../core/authentication/authentication.types.js';
import { CACHE_PROVIDER } from '../../core/chaching/cache.types.js';
import type { CacheProvider } from '../../core/chaching/cache.types.js';
import {TOKEN_INSPECTOR,} from '../../core/authentication/authentication.types.js';
import type {TokenInspector,} from '../../core/authentication/authentication.types.js';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,

    @Inject(TOKEN_ISSUER)
    private readonly tokenIssuer: TokenIssuer,
    @Inject(CACHE_PROVIDER)
    private readonly cache: CacheProvider,
    @Inject(TOKEN_INSPECTOR)
    private readonly tokenInspector: TokenInspector,
  ) {}

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const existingUser = await this.usersService.findByEmail(
      data.email,
    );

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersService.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
});

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }


  async login(data: {
    email: string;
    password: string;
  }) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.tokenIssuer.issueAccessToken({
      id: user.id,
      role: user.role,
    });

    return {
      access_token: accessToken,
    };
  }

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

}
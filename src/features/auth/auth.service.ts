
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
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
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
/**
 * create a new user account
 * @param dto the user data
 * @returns the new user id ,email and role
 */
  async register(dto:RegisterDto) {
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
 * checks the user credentials skd create a access token 
 * 
 * @param dto the user login data
 * @returns object access token 
 */
  async login(dto:LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
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


  /**
   * Revokes the current access token until it expires.
   * 
   * @param jti the uniq id of the access token
   * @param expiresAt  the token expirtion
   * @returns A message confirming logout.
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
 * 
 * @param userId the iD of the user.
 * @param dto The current and new password.
 * @returns A message confirming the password change.
 * @throws UnauthorizedException if the user does not exist or the current password is incorrect.
 */
async changePassword(
userId:number,
dto:ChangePasswordDto
):Promise<{message:string}> {
  const user = await this.usersService.findById(userId)

  if(!user){
    throw new UnauthorizedException('invalid user')
  }

  const isPasswordValid = await bcrypt.compare(
    dto.currentPassword,
    user.password
  );

  if(!isPasswordValid){
    throw new UnauthorizedException('current password id incorrect')
  }

  const hashPassword = await bcrypt.hash(dto.newPassword,10);
  await this.usersService.updatePassword(user.id,hashPassword);

  return{
    message:'Password changed successfully',
  };

}

}
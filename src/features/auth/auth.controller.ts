import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';

import type {
  AuthenticatedToken,
  AuthenticatedUser,
} from '../../core/authentication/authentication.types.js';


type LogoutRequest = Request & {
  authToken: AuthenticatedToken;
};

const REFRESH_COOKIE_NAME = 'refresh_token';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};



@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid registration data',
  })
  @ApiConflictResponse({
    description: 'A user with this email already exists',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiOkResponse({
    description: 'User logged in successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    response.cookie(
      REFRESH_COOKIE_NAME,
      result.refresh_token,
      REFRESH_COOKIE_OPTIONS,
    );

    return {
      access_token: result.access_token,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];
    if (typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    response.cookie(
      REFRESH_COOKIE_NAME,
      result.refresh_token,
      REFRESH_COOKIE_OPTIONS,
    );
// console.log('Set-Cookie:', response.getHeader('Set-Cookie'));

    return {
      access_Token: result.access_token,
    };
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: LogoutRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { jti, expiresAt } = request.authToken;

    const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];

    const result = await this.authService.logout(
      jti,
      expiresAt,
      typeof refreshToken === 'string' ? refreshToken : undefined,
    );

    response.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

    return result;
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiCreatedResponse({
    description: 'Password changed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
  })
  @ApiUnauthorizedResponse({
    description:
      'Missing or invalid authentication token, or incorrect current password',
  })
  @UseGuards(JwtAuthGuard)
  changepassword(
    @Body() dto: ChangePasswordDto,
    @RequestedUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(user.id, dto);
  }
}

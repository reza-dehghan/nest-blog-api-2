
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }




  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out the current user' })
  @ApiOkResponse({
    description: 'User logged out successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Req() request: LogoutRequest) {
    const { jti, expiresAt } = request.authToken;

    return this.authService.logout(jti, expiresAt);
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
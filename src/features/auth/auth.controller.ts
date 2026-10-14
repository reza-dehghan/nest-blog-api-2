
import { Body, Controller, HttpCode, HttpStatus, Post,Req,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

import type { AuthenticatedToken } from '../../core/authentication/authentication.types.js';
type LogoutRequest = Request & {
  authToken: AuthenticatedToken;
};


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Req() request: LogoutRequest) {
    const { jti, expiresAt } = request.authToken;

    return this.authService.logout(jti, expiresAt);
  }

}

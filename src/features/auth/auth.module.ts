
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';
import { AuthService } from './auth.service.js';
import { RequestContextModule } from '../../core/request-context/request-context.module.js';

@Module({
  imports: [
    UsersModule,
    AuthenticationModule,
    RequestContextModule,
  ],
   controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

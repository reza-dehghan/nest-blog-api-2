
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './jwt/roles.guard.js';
import {
  AUTHENTICATION_PROVIDER,
  TOKEN_ISSUER,
  TOKEN_INSPECTOR,
} from '../../core/authentication/authentication.types.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtAuthenticationService } from './jwt/jwt-authentication.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
          throw new Error(
            'JWT_SECRET must be at least 32 bytes long',
          );
        }

        return {
          secret,
          // signOptions: {
          //   expiresIn: '15m',
          // },
        };
      },
    }),
  ],
  providers: [
    JwtAuthenticationService,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: AUTHENTICATION_PROVIDER,
      useExisting: JwtAuthenticationService,
    },
    {
      provide: TOKEN_ISSUER,
      useExisting: JwtAuthenticationService,
    },
    {
    provide: TOKEN_INSPECTOR,
    useExisting: JwtAuthenticationService,
    },
  ],
  exports: [
    AUTHENTICATION_PROVIDER,
    TOKEN_ISSUER,
    TOKEN_INSPECTOR,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthenticationModule {}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity.js';
import { Profile } from '../entities/profile.entity.js';
import { UsersService } from './users.service.js';
import { UsersController } from './user.controller.js';
import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Profile]),
        AuthenticationModule,
],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService],
})
export class UsersModule { }

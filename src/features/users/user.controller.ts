
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';
import { UserRole } from '../entities/user.entity.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';

import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  getMyProfile(
    @RequestedUser() user: AuthenticatedUser,
  ) {
    return this.usersService.getMyProfile(user.id);
  }

  @Patch('me')
  updateMyProfile(
    @RequestedUser() user: AuthenticatedUser,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.usersService.updateMyProfile(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.usersService.remove(id);
  }
}

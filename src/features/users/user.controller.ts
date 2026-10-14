
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
  UseGuards
} from '@nestjs/common';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';

import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  
@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.usersService.findOne(id);
}

@Get()
findAll() {
  return this.usersService.findAll();
}


@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async remove(
  @Param('id', ParseIntPipe) id: number,
): Promise<void> {
  await this.usersService.remove(id);
}



}
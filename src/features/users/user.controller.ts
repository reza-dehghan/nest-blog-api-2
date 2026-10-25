
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

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';
import { UserRole } from '../entities/user.entity.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';

import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get my profile',
    description: 'Returns the profile of the authenticated user.',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  getMyProfile(
    @RequestedUser() user: AuthenticatedUser,
  ) {
    return this.usersService.getMyProfile(user.id);
  }





  @Patch('me')
  @ApiOperation({
    summary: 'Update my profile',
    description: 'Updates the profile of the authenticated user.',
  })
  @ApiBody({
    type: UpdateMyProfileDto,
  })
  @ApiOkResponse({
    description: 'User profile updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid profile data.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  updateMyProfile(
    @RequestedUser() user: AuthenticatedUser,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.usersService.updateMyProfile(user.id, dto);
  }





  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a user',
    description: 'Updates a user by ID. Accessible only to administrators.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The user ID.',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiOkResponse({
    description: 'User updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID or request data.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }





  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Returns a user by ID. Accessible only to administrators.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The user ID.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'User retrieved successfully.',
  })
  @ApiBadRequestResponse({
    description: 'User ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(id);
  }





  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns all users. Accessible only to administrators.',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  findAll() {
    return this.usersService.findAll();
  }




  
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Deletes a user by ID. Accessible only to administrators.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The user ID.',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'User ID must be a valid integer.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.usersService.remove(id);
  }
}
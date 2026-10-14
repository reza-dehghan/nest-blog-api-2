
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post as HttpPost,
  UseGuards,
  Query,
} from '@nestjs/common';

import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';

import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';
import { UserRole } from '../entities/user.entity.js';
import { PostQueryDto } from './dto/post-query.dto.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Create a post (ADMIN only)
  @HttpPost()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() createPostDto: CreatePostDto,
    @RequestedUser() user: AuthenticatedUser,
  ) {
      console.log('POST controller reached');

    return this.postsService.create(createPostDto, user.id);
  }

  // Get all published posts (public)
  @Get()
  findPublished(@Query()query:PostQueryDto) {
    return this.postsService.findPublished(query);
  }

  // Get all posts for admin (ADMIN only)
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllForAdmin() {
    return this.postsService.findAllForAdmin();
  }

  // Get one post for admin (ADMIN only)
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOneForAdmin(id);
  }

  // Get one published post (public)
  @Get(':id')
  findPublishedOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findPublishedOne(id);
  }

  // Update a post (ADMIN only)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  // Delete a post (ADMIN only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}


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

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostQueryDto } from './dto/post-query.dto.js';

import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';

import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';
import { UserRole } from '../entities/user.entity.js';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
  ) {}

  @HttpPost()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a post',
    description: 'Creates a new post. Accessible only to administrators.',
  })
  @ApiBody({ type: CreatePostDto })
  @ApiCreatedResponse({
    description: 'Post created successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  /** Creates a new post. */
  create(
    @Body() createPostDto: CreatePostDto,
    @RequestedUser() user: AuthenticatedUser,
  ) {
    return this.postsService.create(createPostDto, user.id);
  }




  
  @Get()
  @ApiOperation({
    summary: 'Get published posts',
    description: 'Returns published posts with optional search, filtering, and sorting.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search posts by text.',
    example: 'NestJS',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Filter posts by category ID.',
    example: 1,
  })
  @ApiQuery({
    name: 'tagId',
    required: false,
    type: Number,
    description: 'Filter posts by tag ID.',
    example: 2,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['title', 'createdAt', 'updatedAt'],
    description: 'Field used to sort posts.',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort direction.',
    example: 'DESC',
  })
  @ApiOkResponse({
    description: 'Published posts returned successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
  })
  /** Returns published posts with optional search and filters. */
  findPublished(@Query() query: PostQueryDto) {
    return this.postsService.findPublished(query);
  }


  /** Returns all posts for administrators. */
  @Get('admin/all')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all posts for administrators',
    description: 'Returns all posts, including unpublished posts. Accessible only to administrators.',
  })
  @ApiOkResponse({
    description: 'All posts returned successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllForAdmin() {
    return this.postsService.findAllForAdmin();
  }





  /** Returns a post by ID for administrators. */
  @Get('admin/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a post by ID for administrators',
    description: 'Returns a post by ID, including unpublished posts. Accessible only to administrators.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The post ID.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Post returned successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Post ID must be a valid integer.',
  })
  @ApiNotFoundResponse({
    description: 'Post not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOneForAdmin(id);
  }





  /** Returns a published post by ID. */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a published post by ID',
    description: 'Returns a published post using its ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The post ID.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Published post returned successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Post ID must be a valid integer.',
  })
  @ApiNotFoundResponse({
    description: 'Published post not found.',
  })
  findPublishedOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findPublishedOne(id);
  }





  /** Updates an existing post. */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a post',
    description: 'Updates an existing post. Accessible only to administrators.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The post ID.',
    example: 1,
  })
  @ApiBody({ type: UpdatePostDto })
  @ApiOkResponse({
    description: 'Post updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid post ID or request data.',
  })
  @ApiNotFoundResponse({
    description: 'Post not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }





  /** Deletes a post by ID. */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a post',
    description: 'Deletes a post by ID. Accessible only to administrators.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The post ID.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Post deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Post ID must be a valid integer.',
  })
  @ApiNotFoundResponse({
    description: 'Post not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required or the access token is invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Administrator privileges are required.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }



}

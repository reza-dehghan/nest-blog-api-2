
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';


import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
  })
  findAll() {
    return this.categoriesService.findAll();
  }





  @Get(':id')
  @ApiOperation({
    summary: 'Get a category by ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Category retrieved successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }





  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a category',
  })
  @ApiCreatedResponse({
    description: 'Category created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid category data',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can create categories',
  })
  @ApiConflictResponse({
    description: 'A category with the same unique value already exists',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }





  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a category',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category to update',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Category updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID or request data',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can update categories',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiConflictResponse({
    description: 'The updated category conflicts with an existing category',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }




  
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a category',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category to delete',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Category deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Only administrators can delete categories',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}

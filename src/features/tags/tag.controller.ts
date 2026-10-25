
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TagsService } from './tags.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { UserRole } from '../entities/user.entity.js';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
    constructor(
        private readonly tagsService: TagsService,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Get all tags',
        description: 'Returns all tags.',
    })
    @ApiOkResponse({
        description: 'Tags returned successfully.',
    })
    findAll() {
        return this.tagsService.findAll();
    }





    @Get(':id')
    @ApiOperation({
        summary: 'Get a tag by ID',
        description: 'Returns a tag using its ID.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The tag ID.',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Tag returned successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Tag ID must be a valid integer.',
    })
    @ApiNotFoundResponse({
        description: 'Tag not found.',
    })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tagsService.findOne(id);
    }





    @Post()
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create a tag',
        description: 'Creates a new tag. Accessible only to administrators.',
    })
    @ApiBody({
        type: CreateTagDto,
    })
    @ApiCreatedResponse({
        description: 'Tag created successfully.',
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
    @ApiConflictResponse({
        description: 'A tag with the same unique value already exists.',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() dto: CreateTagDto) {
        return this.tagsService.create(dto);
    }





    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update a tag',
        description: 'Updates an existing tag. Accessible only to administrators.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The tag ID.',
        example: 1,
    })
    @ApiBody({
        type: UpdateTagDto,
    })
    @ApiOkResponse({
        description: 'Tag updated successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Invalid tag ID or request data.',
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication is required or the access token is invalid.',
    })
    @ApiForbiddenResponse({
        description: 'Administrator privileges are required.',
    })
    @ApiNotFoundResponse({
        description: 'Tag not found.',
    })
    @ApiConflictResponse({
        description: 'A tag with the same unique value already exists.',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTagDto,
    ) {
        return this.tagsService.update(id, dto);
    }




    
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete a tag',
        description: 'Deletes a tag by ID. Accessible only to administrators.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The tag ID.',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Tag deleted successfully.',
    })
    @ApiBadRequestResponse({
        description: 'Tag ID must be a valid integer.',
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication is required or the access token is invalid.',
    })
    @ApiForbiddenResponse({
        description: 'Administrator privileges are required.',
    })
    @ApiNotFoundResponse({
        description: 'Tag not found.',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tagsService.remove(id);
    }
}

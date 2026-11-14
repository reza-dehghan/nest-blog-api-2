
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
    Query,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { BlocksService } from './blocks.service.js';
import { CreateBlockDto } from './dto/create-block.dto.js';
import { UpdateBlockDto } from './dto/update-block.dto.js';

import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';

@ApiTags('Blocks')
@Controller()
export class BlocksController {
    constructor(
        private readonly blocksService: BlocksService,
    ) {}

    @Post('posts/:postId/blocks')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create a block for a post',
    })
    @ApiParam({
        name: 'postId',
        type: Number,
        description: 'ID of the post to add the block to',
        example: 1,
    })
    @ApiCreatedResponse({
        description: 'Block created successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid post ID or request data',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid authentication token',
    })
    @ApiForbiddenResponse({
        description: 'User is not allowed to manage this post',
    })
    @ApiNotFoundResponse({
        description: 'Post not found',
    })
    @UseGuards(JwtAuthGuard)
    create(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() dto: CreateBlockDto,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.blocksService.create(postId, dto, user);
    }





    @Patch('blocks/:id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update a block',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID of the block to update',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Block updated successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid block ID or request data',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid authentication token',
    })
    @ApiForbiddenResponse({
        description: 'User is not allowed to update this block',
    })
    @ApiNotFoundResponse({
        description: 'Block not found',
    })
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBlockDto,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.blocksService.update(id, dto, user);
    }





    @Get('posts/:postId/blocks')
    @ApiOperation({
        summary: 'Get initial blocks of a post',
    })
    @ApiParam({
        name: 'postId',
        type: Number,
        description: 'ID of the post',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Initial blocks retrieved successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid post ID',
    })
    @ApiNotFoundResponse({
        description: 'Post not found',
    })
    getInitialBlocks(
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        return this.blocksService.getInitialBlocks(postId);
    }





    @Get('posts/:postId/blocks/next')
    @ApiOperation({
        summary: 'Get the next blocks of a post',
        description:
            'Retrieves blocks positioned after the specified position.',
    })
    @ApiParam({
        name: 'postId',
        type: Number,
        description: 'ID of the post',
        example: 1,
    })
    @ApiQuery({
        name: 'afterPosition',
        type: Number,
        required: true,
        description: 'Position after which to retrieve blocks',
        example: 5,
    })
    @ApiOkResponse({
        description: 'Next blocks retrieved successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid post ID or afterPosition',
    })
    @ApiNotFoundResponse({
        description: 'Post not found',
    })
    getNextBlocks(
        @Param('postId', ParseIntPipe) postId: number,
        @Query('afterPosition', ParseIntPipe) afterPosition: number,
    ) {
        return this.blocksService.getNextBlocks(
            postId,
            afterPosition,
        );
    }




    
    @Delete('blocks/:id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete a block',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID of the block to delete',
        example: 1,
    })
    @ApiNoContentResponse({
        description: 'Block deleted successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid block ID',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid authentication token',
    })
    @ApiForbiddenResponse({
        description: 'User is not allowed to delete this block',
    })
    @ApiNotFoundResponse({
        description: 'Block not found',
    })
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id', ParseIntPipe) id: number,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.blocksService.remove(id, user);
    }
}

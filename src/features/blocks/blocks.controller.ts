
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

import { BlocksService } from './blocks.service.js';
import { CreateBlockDto } from './dto/create-block.dto.js';
import { UpdateBlockDto } from './dto/update-block.dto.js';

import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';

@Controller()
export class BlocksController {
    constructor(
        private readonly blocksService: BlocksService,
    ) {}

    @Post('posts/:postId/blocks')
    @UseGuards(JwtAuthGuard)
    create(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() dto: CreateBlockDto,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.blocksService.create(postId, dto, user);
    }

    @Patch('blocks/:id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBlockDto,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.blocksService.update(id, dto, user);
    }

    @Get('posts/:postId/blocks')
    getInitialBlocks(
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        return this.blocksService.getInitialBlocks(postId);
    }

    @Get('posts/:postId/blocks/next')
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
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id', ParseIntPipe) id: number,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.blocksService.remove(id, user);
    }
}

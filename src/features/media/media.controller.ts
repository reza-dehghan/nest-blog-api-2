
import {
    BadRequestException,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    Patch,
    Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';

import { MediaService } from './media.service.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';

@Controller('media')
export class MediaController {
    constructor(
        private readonly mediaService: MediaService,
    ) {}

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {
                fileSize: 5 * 1024 * 1024,
                files: 1,
            },
        }),
    )
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @RequestedUser() user:AuthenticatedUser,
    ) {
        if (!file) {
            throw new BadRequestException('File is required.');
        }

        return this.mediaService.upload({
            buffer: file.buffer,
            originalName: file.originalname,
            ownerId:user.id,
        });
    }

    @Get(':id/access')
    async getAccess(
        @Param('id', ParseIntPipe) id: number,
        @Res() response: Response,
    ) {
        const url = await this.mediaService.getReadAccess(id);

        return response.redirect(302, url);
    }

    
    @Patch('avatar')
    @UseGuards(JwtAuthGuard)
    async updateAvatar(
        @Body('mediaId', ParseIntPipe) mediaId: number,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.mediaService.updateAvatar(user.id, mediaId);
    }

}


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
    Body,
} from '@nestjs/common';

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiFoundResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';

import { MediaService } from './media.service.js';
import { JwtAuthGuard } from '../../infra/authentication/guards/jwt-auth.guard.js';
import { RequestedUser } from '../../infra/authentication/decorators/requested-user.decorator.js';
import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';
import { Roles } from '../../infra/authentication/decorators/roles.decorator.js';
import { RolesGuard } from '../../infra/authentication/jwt/roles.guard.js';
import { UserRole } from '../entities/user.entity.js';

@ApiTags('Media')
@Controller('media')
export class MediaController {
    constructor(
        private readonly mediaService: MediaService,
    ) {}

    @Post('upload')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Upload a media file',
        description: 'Uploads a file for the authenticated user. The maximum file size is 5 MB.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'The file to upload (maximum 5 MB).',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'The media file was uploaded successfully.',
    })
    @ApiBadRequestResponse({
        description: 'The file is missing or the request is invalid.',
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication is required or the access token is invalid.',
    })
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
        @RequestedUser() user: AuthenticatedUser,
    ) {
        if (!file) {
            throw new BadRequestException('File is required.');
        }

        return this.mediaService.upload({
            buffer: file.buffer,
            originalName: file.originalname,
            ownerId: user.id,
        });
    }





    @Get(':id/access')
    @ApiOperation({
        summary: 'Get media access',
        description: 'Redirects the client to the media read URL.',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'The media ID.',
        example: 1,
    })
    @ApiFoundResponse({
        description: 'Redirects to the media read URL (HTTP 302).',
    })
    @ApiBadRequestResponse({
        description: 'The media ID is invalid.',
    })
    @ApiNotFoundResponse({
        description: 'The media resource was not found.',
    })
    async getAccess(
        @Param('id', ParseIntPipe) id: number,
        @Res() response: Response,
    ) {
        const url = await this.mediaService.getReadAccess(id);

        return response.redirect(302, url);
    }





    @Patch('avatar')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update the current user avatar',
        description: 'Sets an uploaded media file as the authenticated user avatar.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['mediaId'],
            properties: {
                mediaId: {
                    type: 'integer',
                    example: 1,
                    description: 'The ID of the uploaded media file.',
                },
            },
        },
    })
    @ApiOkResponse({
        description: 'The user avatar was updated successfully.',
    })
    @ApiBadRequestResponse({
        description: 'The media ID is invalid or the request is invalid.',
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication is required or the access token is invalid.',
    })
    @UseGuards(JwtAuthGuard)
    async updateAvatar(
        @Body('mediaId', ParseIntPipe) mediaId: number,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.mediaService.updateAvatar(user.id, mediaId);
    }




    
    @Post('posts/:postId')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Attach media to a post',
        description: 'Attaches an uploaded media file to a post. Accessible only to administrators.',
    })
    @ApiParam({
        name: 'postId',
        type: Number,
        description: 'The ID of the post.',
        example: 1,
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['mediaId'],
            properties: {
                mediaId: {
                    type: 'integer',
                    example: 2,
                    description: 'The ID of the media file to attach.',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'The media file was attached to the post successfully.',
    })
    @ApiBadRequestResponse({
        description: 'The post ID or media ID is invalid.',
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication is required or the access token is invalid.',
    })
    @ApiForbiddenResponse({
        description: 'The authenticated user does not have administrator privileges.',
    })
    @ApiNotFoundResponse({
        description: 'The post or media resource was not found.',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async attachToPost(
        @Param('postId', ParseIntPipe) postId: number,
        @Body('mediaId', ParseIntPipe) mediaId: number,
        @RequestedUser() user: AuthenticatedUser,
    ) {
        return this.mediaService.attachToPost(
            user.id,
            postId,
            mediaId,
        );
    }
}

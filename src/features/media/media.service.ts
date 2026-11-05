
import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import { Repository } from 'typeorm';

import { Media } from './entities/media.entity.js';
import { STORAGE_PROVIDER } from '../../core/storage/storage.constants.js';
import type { StorageProvider } from '../../core/storage/storage.interface.js';
import type { UploadMediaInput } from './dto/upload-media.dto.js';
import { Profile } from '../entities/profile.entity.js';
import { Post } from '../posts/entities/post.entity.js';


@Injectable()
export class MediaService {

    private readonly logger = new Logger(MediaService.name);

    constructor(
        @InjectRepository(Media)
        private readonly mediaRepository: Repository<Media>,

        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider,

        @InjectRepository(Profile)
        private readonly profileRepository :Repository<Profile>,

        @InjectRepository(Post)
        private readonly postRepository:Repository<Post>
    ) {}





    async upload(input: UploadMediaInput): Promise<Media> {
        const maxSize = 5 * 1024 * 1024;

        const allowedTypes: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
        };

        if (!input.buffer?.length) {
            throw new BadRequestException('File is required.');
        }

        if (input.buffer.length > maxSize) {
            throw new BadRequestException('File is too large.');
        }

        const detectedType = await fileTypeFromBuffer(input.buffer);
        const extension = detectedType
            ? allowedTypes[detectedType.mime]
            : undefined;

        if (!detectedType || !extension) {
            throw new BadRequestException(
                'Only JPEG, PNG, and WebP images are allowed.',
            );
        }

        const storageKey = `media/${randomUUID()}.${extension}`;

        await this.storageProvider.upload({
            key: storageKey,
            body: input.buffer,
            contentType: detectedType.mime,
        });

        try {
            const media = this.mediaRepository.create({
                storageKey,
                originalName: input.originalName,
                contentType: detectedType.mime,
                size: String(input.buffer.length),
                owner:{id:input.ownerId},
            });

           const savedMedia = await this.mediaRepository.save(media);

                this.logger.log('Media uploaded successfully', {
                    mediaId: savedMedia.id,
                    ownerId: input.ownerId,
                    contentType: detectedType.mime,
                });

                return savedMedia;  
        } catch {
            try {
                await this.storageProvider.delete(storageKey);
            } catch {
            }

            throw new InternalServerErrorException(
                'Failed to save media metadata.',
            );
        }
    }







async attachToPost(
    userId: number,
    postId: number,
    mediaId: number,
): Promise<{ postId: number; mediaId: number }> {
    const post = await this.postRepository.findOne({
        where: { id: postId },
    });

    if (!post) {
        throw new NotFoundException('Post not found.');
    }

    const media = await this.mediaRepository.findOne({
        where: { id: mediaId },
        relations: {
            owner: true,
            post: true,
        },
    });

    if (!media) {
        throw new NotFoundException('Media not found.');
    }

    if (media.owner.id !== userId) {
        throw new ForbiddenException(
            'You are not allowed to use this media.',
        );
    }

    const profile = await this.profileRepository.findOne({
    where: {
        avatarMedia: { id: mediaId },
    },
   });

if (profile) {
    throw new BadRequestException(
        'Profile avatar cannot be attached to a post.',
    );
}

    if (media.post) {
        throw new BadRequestException(
            'Media is already attached to a post.',
        );
    }

    media.post = post;
    await this.mediaRepository.save(media);


    this.logger.log('Media attached to post successfully', {
    mediaId,
    postId,
    userId,
});

    return {
        postId,
        mediaId,
    };
}






async getReadAccess(id: number): Promise<string> {
    const media = await this.mediaRepository.findOne({
        where: { id },
        relations: {
            post: true,
        },
    });

    if (!media) {
        throw new NotFoundException('Media not found.');
    }

    const isAvatar = await this.profileRepository.exists({
        where: {
            avatarMedia: { id },
        },
    });

    const isPublishedPostImage =
        media.post !== null && media.post.isPublished;

    if (!isAvatar && !isPublishedPostImage) {
        throw new ForbiddenException(
            'You are not allowed to access this media.',
        );
    }

    const access = await this.storageProvider.getReadAccess(
        media.storageKey,
        300,
    );

    if (access.type !== 'redirect') {
        throw new InternalServerErrorException(
            'Storage provider does not support redirect access.',
        );
    }

    return access.url;
}






    async updateAvatar(userId: number, mediaId: number):Promise<{ profileId: number; avatarMediaId: number }> {
    const media = await this.mediaRepository.findOne({
        where: { id: mediaId },
        relations: {
            owner: true,
            post:true,
        },
    });

    if (!media) {
        throw new NotFoundException('Media not found.');
    }

    if (media.owner.id !== userId) {
        throw new ForbiddenException(
            'You are not allowed to use this media.',
        );
    }

    const profile = await this.profileRepository.findOne({
        where: {
            user: { id: userId },
        },
    });
    if (media.post) {
    throw new BadRequestException(
        'Post images cannot be used as profile avatars.',
    );
}

    if (!profile) {
        throw new NotFoundException('Profile not found.');
    }

    profile.avatarMedia = media;

    const savedProfile = await this.profileRepository.save(profile);

    this.logger.log('Profile avatar updated successfully', {
    profileId: savedProfile.id,
    userId,
    mediaId,
    });

    return {
        profileId: savedProfile.id,
        avatarMediaId: media.id,
    };
}


}

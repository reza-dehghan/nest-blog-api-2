
import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
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

@Injectable()
export class MediaService {
    constructor(
        @InjectRepository(Media)
        private readonly mediaRepository: Repository<Media>,

        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider,

        @InjectRepository(Profile)
        private readonly profileRepository :Repository<Profile>,
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

            return await this.mediaRepository.save(media);
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

        if (!media.post || !media.post.isPublished) {
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

    if (!profile) {
        throw new NotFoundException('Profile not found.');
    }

    profile.avatarMedia = media;

    const savedProfile = await this.profileRepository.save(profile);

    return {
        profileId: savedProfile.id,
        avatarMediaId: media.id,
    };
}


}

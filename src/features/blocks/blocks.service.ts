
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Block, BlockType } from './entities/block.entity.js';
import { Post } from '../posts/entities/post.entity.js';
import { Media } from '../media/entities/media.entity.js';
import { UserRole } from '../entities/user.entity.js';

import type { AuthenticatedUser } from '../../core/authentication/authentication.types.js';

import { CreateBlockDto } from './dto/create-block.dto.js';
import { UpdateBlockDto } from './dto/update-block.dto.js';

@Injectable()
export class BlocksService {
    constructor(
        @InjectRepository(Block)
        private readonly blocksRepository: Repository<Block>,

        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,

        @InjectRepository(Media)
        private readonly mediaRepository: Repository<Media>,

        private readonly dataSource: DataSource,
    ) {}


    private validateContent(content: string): void {
        if (Buffer.byteLength(content, 'utf8') > 1024) {
            throw new BadRequestException(
                'Block content must not exceed 1024 bytes.',
            );
        }

        if (!content.trim()) {
            throw new BadRequestException(
                'Block content cannot be empty.',
            );
        }
    }

    /**
     * Checks whether the user is allowed to manage the post.

     * @param post 
     * @param user 
     */
    private ensureCanManagePost(
        post: Post,
        user: AuthenticatedUser,
    ): void {
        if (
            user.role !== UserRole.ADMIN &&
            post.authorId !== user.id
        ) {
            throw new ForbiddenException(
                'You cannot modify this post.',
            );
        }
    }



    async create(
        postId: number,
        dto: CreateBlockDto,
        user: AuthenticatedUser,
    ): Promise<Block> {
        const post = await this.postsRepository.findOneBy({
            id: postId,
        });

        if (!post) {
            throw new NotFoundException('Post not found.');
        }

        this.ensureCanManagePost(post, user);

        const type = dto.type ?? BlockType.TEXT;

        try {
            return await this.dataSource.transaction(
                async (manager) => {
                    let content = '';
                    let mediaId: number | null = null;

                    if (type === BlockType.TEXT) {
                        if (dto.content === undefined) {
                            throw new BadRequestException(
                                'Content is required for text blocks.',
                            );
                        }
                        this.validateContent(dto.content);
                        content = dto.content;


                    } else if (type === BlockType.IMAGE) {
                        if (dto.mediaId === undefined) {
                            throw new BadRequestException(
                                'Media ID is required for image blocks.',
                            );
                        }

                        const media = await manager.findOne(Media, {
                            where: { id: dto.mediaId },
                            relations: {
                                owner: true,
                                post: true,
                            },
                        });

                        if (!media) {
                            throw new NotFoundException(
                                'Media not found.',
                            );
                        }

                        if (
                            media.owner.id !== user.id &&
                            user.role !== UserRole.ADMIN
                        ) {
                            throw new ForbiddenException(
                                'You cannot use this media.',
                            );
                        }

                        if (
                            media.post &&
                            media.post.id !== postId
                        ) {
                            throw new BadRequestException(
                                'This media is already attached to another post.',
                            );
                        }

                        media.post = post;
                        await manager.save(Media, media);

                        mediaId = media.id;
                    } else {
                        throw new BadRequestException(
                            'Invalid block type.',
                        );
                    }

                    const block = manager.create(Block, {
                        postId,
                        type,
                        content,
                        mediaId,
                        position: dto.position,
                    });

                    return manager.save(Block, block);
                },
            );
        } catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === '23505'
            ) {
                throw new BadRequestException(
                    'This position is already used by another block in this post.',
                );
            }

            throw error;
        }
    }


    

    async update(
        id: number,
        dto: UpdateBlockDto,
        user: AuthenticatedUser,
    ): Promise<Block> {
        const block = await this.blocksRepository.findOne({
            where: { id },
            relations: { post: true },
        });

        if (!block) {
            throw new NotFoundException('Block not found.');
        }

        this.ensureCanManagePost(block.post, user);

        if (dto.content !== undefined) {
            if (block.type !== BlockType.TEXT) {
                throw new BadRequestException(
                    'Only text blocks can have their content updated.',
                );
            }

            this.validateContent(dto.content);
            block.content = dto.content;
        }

        if (dto.position !== undefined) {
            block.position = dto.position;
        }

        try {
            return await this.blocksRepository.save(block);
        } catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === '23505'
            ) {
                throw new BadRequestException(
                    'This position is already used by another block in this post.',
                );
            }

            throw error;
        }
    }

    async getInitialBlocks(postId: number): Promise<Block[]> {
        const post = await this.postsRepository.findOneBy({
            id: postId,
            isPublished: true,
        });

        if (!post) {
            throw new NotFoundException('Post not found.');
        }

        return this.blocksRepository.find({
            where: { postId },
            order: { position: 'ASC' },
            take: 3,
        });
    }

    async getNextBlocks(
        postId: number,
        afterPosition: number,
    ): Promise<Block[]> {
        const post = await this.postsRepository.findOneBy({
            id: postId,
            isPublished: true,
        });

        if (!post) {
            throw new NotFoundException('Post not found.');
        }

        return this.blocksRepository
            .createQueryBuilder('block')
            .where('block.postId = :postId', { postId })
            .andWhere(
                'block.position > :afterPosition',
                { afterPosition },
            )
            .orderBy('block.position', 'ASC')
            .take(3)
            .getMany();
    }



    async remove(
        id: number,
        user: AuthenticatedUser,
    ): Promise<void> {
        const block = await this.blocksRepository.findOne({
            where: { id },
            relations: { post: true },
        });

        if (!block) {
            throw new NotFoundException('Block not found.');
        }

        this.ensureCanManagePost(block.post, user);

        await this.blocksRepository.remove(block);
    }
}


import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Tag } from './entities/tag.entity.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';

@Injectable()
export class TagsService {

    private readonly logger= new Logger(TagsService.name)

    constructor(
        @InjectRepository(Tag)
        private readonly tagsRepository: Repository<Tag>,
    ) {}

    private generateSlug(name: string): string {
        return name
            .normalize('NFC')
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, '-')
            .replace(/^-+|-+$/g, '');
    }

    private async generateUniqueSlug(
        name: string,
        excludeId?: number,
    ): Promise<string> {
        const baseSlug = this.generateSlug(name);

        if (!baseSlug) {
            throw new BadRequestException(
                'Cannot generate a slug from this name',
            );
        }

        let slug = baseSlug;
        let counter = 2;

        while (
            await this.tagsRepository.exists({
                where: {
                    slug,
                    ...(excludeId !== undefined? { id: Not(excludeId) }: {}),
                },
            })
        ) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }


    /**
     * create a new tag
     * @param dto 
     * @returns 
     */
    async create(dto: CreateTagDto): Promise<Tag> {
        const tag = this.tagsRepository.create({
            name: dto.name.trim(),
            slug: await this.generateUniqueSlug(dto.name),
        });

      const tagSaved = await this.tagsRepository.save(tag);

        this.logger.log('Tag create successfuly',{
            tagId:tagSaved.id
        });
        return tagSaved;
    }




    async findAll(): Promise<Tag[]> {
        return this.tagsRepository.find({
            order: { name: 'ASC' },
        });
    }



    async findOne(id: number): Promise<Tag> {
        const tag = await this.tagsRepository.findOne({
            where: { id },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return tag;
    }




    async update(
        id: number,
        dto: UpdateTagDto,
    ): Promise<Tag> {
        const tag = await this.findOne(id);

        if (dto.name !== undefined) {
            tag.name = dto.name.trim();
            tag.slug = await this.generateUniqueSlug(dto.name, id);
        }

        const tagSaved= await this.tagsRepository.save(tag);


       this.logger.log('tag update successfuly',{
        tagId:tagSaved.id,
       });

        return this.findOne(id);
    }





    async remove(id: number): Promise<void> {
        const tag = await this.tagsRepository.findOne({
            where: { id },
            relations: { posts: true },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        if (tag.posts.length > 0) {
            throw new BadRequestException(
                'Cannot delete a tag that is assigned to posts',
            );
        }

        await this.tagsRepository.remove(tag);

        this.logger.log('Tag deleted successfully', {
        tagId: id,
    });

    }
}

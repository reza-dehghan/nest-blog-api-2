import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
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
      await this.categoriesRepository.exists({
        where: {
          slug,
          ...(excludeId !== undefined ? { id: Not(excludeId) } : {}),
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      name: dto.name.trim(),
      slug: await this.generateUniqueSlug(dto.name),
      description: dto.description ?? null,
    });

    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name !== undefined) {
      category.name = dto.name.trim();
      category.slug = await this.generateUniqueSlug(dto.name, id);
    }

    if (dto.description !== undefined) {
      category.description = dto.description;
    }

    await this.categoriesRepository.save(category);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { posts: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.posts.length > 0) {
      throw new BadRequestException(
        'Cannot delete a category that is assigned to posts',
      );
    }

    await this.categoriesRepository.remove(category);
  }
}
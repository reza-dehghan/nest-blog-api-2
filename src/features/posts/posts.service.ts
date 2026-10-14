
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository,Brackets } from 'typeorm';

import { Post } from './entities/post.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Tag } from '../tags/entities/tag.entity.js';

import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostQueryDto } from './dto/post-query.dto.js';



@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,

    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  // Generate slug from title
  private generateSlug(title: string): string {
    return title
      .normalize('NFC')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Generate a unique slug
  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.generateSlug(title);

    if (!baseSlug) {
      throw new BadRequestException(
        'Cannot generate a slug from this title',
      );
    }

    let slug = baseSlug;
    let counter = 2;

    while (await this.postsRepository.exists({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Find categories and validate their IDs
  private async findCategories(ids: number[]): Promise<Category[]> {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
      throw new BadRequestException(
        'Duplicate category IDs are not allowed',
      );
    }

    const categories = await this.categoriesRepository.findBy({
      id: In(uniqueIds),
    });

    if (categories.length !== uniqueIds.length) {
      throw new BadRequestException(
        'One or more categories do not exist',
      );
    }

    return categories;
  }

  // Find tags and validate their IDs
  private async findTags(ids: number[]): Promise<Tag[]> {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
      throw new BadRequestException(
        'Duplicate tag IDs are not allowed',
      );
    }

    const tags = await this.tagsRepository.findBy({
      id: In(uniqueIds),
    });

    if (tags.length !== uniqueIds.length) {
      throw new BadRequestException(
        'One or more tags do not exist',
      );
    }

    return tags;
  }

  // Create post
  async create(dto: CreatePostDto, userId: number): Promise<Post> {
     console.log('1. create started');
    const { title, excerpt, isPublished } = dto;

    const categories = await this.findCategories(
      dto.categoryIds ?? [],
    );
    console.log('2. categories found');

    const tags = await this.findTags(dto.tagIds ?? []);
  console.log('3. tags found');

    const slug = await this.generateUniqueSlug(title);
      console.log('4. slug generated');

    const published = isPublished ?? false;

    const post = this.postsRepository.create({
      title,
      slug,
      excerpt: excerpt ?? null,
      isPublished: published,
      publishedAt: published ? new Date() : null,
      authorId: userId,
      categories,
      tags,
    });
      console.log('5. saving post');


    // return this.postsRepository.save(post);
    const savedPost = await this.postsRepository.save(post);
  console.log('6. post saved');

  return savedPost;

  }

  // Get all published posts
 async findPublished(query: PostQueryDto): Promise<Post[]> {
  const qb = this.postsRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.categories', 'category')
    .leftJoinAndSelect('post.tags', 'tag')
    .where('post.isPublished = :isPublished', {
      isPublished: true,
    });

  if (query.search) {
    qb.andWhere(
      new Brackets((subQuery) => {
        subQuery
          .where('post.title ILIKE :search')
          .orWhere('post.excerpt ILIKE :search');
      }),
      { search: `%${query.search}%` },
    );
  }

  if (query.categoryId !== undefined) {
  qb.andWhere('category.id = :categoryId', {
    categoryId: query.categoryId,
  });
  }

  if (query.tagId !== undefined) {
    qb.andWhere('tag.id = :tagId', {
      tagId: query.tagId,
    });
  }

 const sortColumns = {
  title: 'post.title',
  createdAt: 'post.createdAt',
  updatedAt: 'post.updatedAt',
} as const;

const sortBy = query.sortBy ?? 'createdAt';
const sortOrder = query.sortOrder ?? 'DESC';

return qb
  .orderBy(sortColumns[sortBy], sortOrder)
  .addOrderBy('post.id', 'DESC')
  .getMany();
}

  // Get one published post
  async findPublishedOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        isPublished: true,
      },
      relations: {
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Published post not found');
    }

    return post;
  }

  // Get all posts for admin
  async findAllForAdmin(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: {
        categories: true,
        tags: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Get one post for admin
  async findOneForAdmin(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  // Update post
  async update(
    id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.findOneForAdmin(id);

    if (updatePostDto.categoryIds !== undefined) {
      post.categories = await this.findCategories(
        updatePostDto.categoryIds,
      );
    }

    if (updatePostDto.tagIds !== undefined) {
      post.tags = await this.findTags(updatePostDto.tagIds);
    }

    if (updatePostDto.title !== undefined) {
      post.title = updatePostDto.title;
    }

    if (updatePostDto.excerpt !== undefined) {
      post.excerpt = updatePostDto.excerpt;
    }

    if (updatePostDto.isPublished !== undefined) {
      if (updatePostDto.isPublished && !post.isPublished) {
        post.publishedAt = new Date();
      } else if (!updatePostDto.isPublished) {
        post.publishedAt = null;
      }

      post.isPublished = updatePostDto.isPublished;
    }

    await this.postsRepository.save(post);

    return this.findOneForAdmin(id);
  }

  // Delete post
  async remove(id: number): Promise<void> {
    const post = await this.findOneForAdmin(id);

    await this.postsRepository.remove(post);
  }
}

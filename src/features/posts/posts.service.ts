import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Brackets } from 'typeorm';

import { Post } from './entities/post.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Tag } from '../tags/entities/tag.entity.js';
import { Media } from '../media/entities/media.entity.js';

import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostQueryDto } from './dto/post-query.dto.js';
import { RequestContextService } from '../../core/request-context/request-context.service.js';
import { TracerService } from '../../core/monitoring/opentelemetry/tracing/tracer.service.js';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,

    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,

    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    private readonly requestContext: RequestContextService,
  ) {}

  /**
   *   Generate slug from title
   * @param title title of post .
   */
  private generateSlug(title: string): string {
    return title
      .normalize('NFC')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate a unique slug
   * @param title
   * @returns slug uniq slug
   */
  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.generateSlug(title);

    if (!baseSlug) {
      throw new BadRequestException('Cannot generate a slug from this title');
    }

    let slug = baseSlug;
    let counter = 2;

    while (await this.postsRepository.exists({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Find categories and validate their IDs
   * @param ids ids of categories
   * @returns category[]
   */
  private async findCategories(ids: number[]): Promise<Category[]> {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
      throw new BadRequestException('Duplicate category IDs are not allowed');
    }

    const categories = await this.categoriesRepository.findBy({
      id: In(uniqueIds),
    });

    if (categories.length !== uniqueIds.length) {
      throw new BadRequestException('One or more categories do not exist');
    }

    return categories;
  }

  /**
   *  Find tags and validate their IDs
   * @param ids
   * @returns tag[]
   */
  private async findTags(ids: number[]): Promise<Tag[]> {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
      throw new BadRequestException('Duplicate tag IDs are not allowed');
    }

    const tags = await this.tagsRepository.findBy({
      id: In(uniqueIds),
    });

    if (tags.length !== uniqueIds.length) {
      throw new BadRequestException('One or more tags do not exist');
    }

    return tags;
  }

  /**
   * Encode cursor data to an opaque base64url string
   * @param data sort value and id of the last item in the page
   * @returns cursor string
   */
  private encodeCursor(data: {
    value: string | number | Date;
    id: number;
  }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64url');
  }

  /**
   * Decode and validate a cursor string
   * @param cursor base64url cursor received from the client
   * @returns decoded sort value and id
   * @throws BadRequestException if the cursor is malformed
   */
  private decodeCursor(cursor: string): {
    value: string | number;
    id: number;
  } {
    try {
      const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString());

      const validValue =
        typeof parsed?.value === 'string' || typeof parsed?.value === 'number';
      const validId = Number.isInteger(parsed?.id);

      if (!validValue || !validId) throw new Error('bad shape');

      return parsed;
    } catch {
      throw new BadRequestException('Invalid cursor');
    }
  }

  /**
   * create post
   * @param dto
   * @param userId
   * @returns Post
   */
  async create(dto: CreatePostDto, userId: number): Promise<Post> {
    const { title, excerpt, isPublished } = dto;

    const categories = await this.findCategories(dto.categoryIds ?? []);

    const tags = await this.findTags(dto.tagIds ?? []);

    const slug = await this.generateUniqueSlug(title);

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

    const savedPost = await this.postsRepository.save(post);

    this.logger.log('Post created successfuly', {
      postId: savedPost.id,
      requestId: this.requestContext.getRequestId(),
    });

    return savedPost;
  }

  /**
   * Get published posts with cursor-based (keyset) pagination
   * @param query post query dto
   * @returns items list of posts and nextCursor (null when there are no more posts)
   */
  async findPublished(query: PostQueryDto): Promise<{
    items: Post[];
    nextCursor: string | null;
  }> {
    const limit = query.limit ?? 10;

    const sortColumns = {
      title: 'post.title',
      createdAt: 'post.createdAt',
      updatedAt: 'post.updatedAt',
    } as const;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    const sortColumn = sortColumns[sortBy];
    const op = sortOrder === 'DESC' ? '<' : '>';

    // ---------- Step 1: only ids with filters, cursor and limit ----------
    const idsQb = this.postsRepository
      .createQueryBuilder('post')
      .select('post.id', 'id')
      .addSelect(sortColumn, 'sortValue')
      .where('post.isPublished = :isPublished', { isPublished: true });

    if (query.search) {
      idsQb.andWhere(
        new Brackets((sub) => {
          sub
            .where('post.title ILIKE :search')
            .orWhere('post.excerpt ILIKE :search');
        }),
        { search: `%${query.search}%` },
      );
    }

    // EXISTS prevents duplicate rows
    // Check the join table names against your real database
    if (query.categoryId !== undefined) {
      idsQb.andWhere(
        `EXISTS (SELECT 1 FROM post_categories_category pc
                 WHERE pc."postId" = post.id AND pc."categoryId" = :categoryId)`,
        { categoryId: query.categoryId },
      );
    }

    if (query.tagId !== undefined) {
      idsQb.andWhere(
        `EXISTS (SELECT 1 FROM post_tags_tag pt
                 WHERE pt."postId" = post.id AND pt."tagId" = :tagId)`,
        { tagId: query.tagId },
      );
    }

    // ---------- Cursor condition (Keyset) ----------
    if (query.cursor) {
      const decoded = this.decodeCursor(query.cursor);
      idsQb.andWhere(
        `(${sortColumn}, post.id) ${op} (:cursorValue, :cursorId)`,
        { cursorValue: decoded.value, cursorId: decoded.id },
      );
    }

    const rows = await idsQb
      .orderBy(sortColumn, sortOrder)
      .addOrderBy('post.id', sortOrder)
      .limit(limit + 1)
      .getRawMany();

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    if (pageRows.length === 0) {
      return { items: [], nextCursor: null };
    }

    // ---------- Step 2: full data with joins only for these ids ----------
    const ids = pageRows.map((r) => r.id);

    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .whereInIds(ids)
      .getMany();

    // Keep the original order
    const map = new Map(posts.map((p) => [p.id, p]));
    const items = ids.map((id) => map.get(id)!);

    const last = pageRows[pageRows.length - 1];
    const nextCursor = hasMore
      ? this.encodeCursor({ value: last.sortValue, id: last.id })
      : null;

    return { items, nextCursor };
  }

  /**
   * Get one published post
   * @param id
   * @returns post
   */
  async findPublishedOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        isPublished: true,
      },
      relations: {
        categories: true,
        tags: true,
        images: true,
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

  /**
   * Get one post for admin
   * @param id
   * @returns post[] list of post
   */
  async findOneForAdmin(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        categories: true,
        tags: true,
        images: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  /**
   *  Update post
   * @param id
   * @param updatePostDto
   * @returns
   */
  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOneForAdmin(id);

    if (updatePostDto.categoryIds !== undefined) {
      post.categories = await this.findCategories(updatePostDto.categoryIds);
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

    this.logger.log('post updated successfuly', {
      postId: id,
    });

    return this.findOneForAdmin(id);
  }

  /**
   * Delete post
   * @param id
   */
  async remove(id: number): Promise<void> {
    const post = await this.findOneForAdmin(id);

    await this.postsRepository.remove(post);

    this.logger.log('post delete successfuly ', {
      postId: id,
    });
  }
}

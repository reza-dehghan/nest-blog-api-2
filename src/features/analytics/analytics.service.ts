
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { inject } from 'vitest';
import { PostViewEvent } from './entities/post-view-event.entity.js';
import { Repository,Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../posts/entities/post.entity.js';
import { User } from '../entities/user.entity.js';

@Injectable()
export class AnalyticsService {

    constructor (
        @InjectRepository(PostViewEvent)
        private readonly postViewEventRepository:Repository<PostViewEvent>,

         @InjectRepository(Post)
        private readonly postRepository:Repository<Post>,

        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
    
    ){}

    /**
     * check start and end date
     * @param startDate 
     * @param endDate 
     */
    private validateDateRange(
        startDate?: string,
        endDate?: string,
    ): void {
        if (
            (startDate === undefined) !==
            (endDate === undefined)
        ) {
            throw new BadRequestException(
            'Both startDate and endDate must be provided together.',
            );
        }

        if (
            startDate !== undefined &&
            endDate !== undefined &&
            startDate > endDate
        ) {
            throw new BadRequestException(
            'startDate must be before or equal to endDate.',
            );
        }
    }


/**
 * Records a user's visit to a published post.
 * @param id 
 * @param userId 
 *  @returns A promise that resolves when the operation completes.
 */
    async recordVisit(
    id: number,
    userId: number,
): Promise<void> {
    const post = await this.postRepository.findOne({
        where: {
            id,
            isPublished: true,
        },
    });

    if (!post) {
        throw new NotFoundException('Published post not found');
    }

    const viewDate = new Date().toISOString().slice(0, 10);

    await this.postViewEventRepository.upsert(
        {
            postId: post.id,
            userId,
            viewDate,
        },
        {
            conflictPaths: ['postId', 'userId', 'viewDate'],
            skipUpdateIfNoValuesChanged: true,
        },
    );
}



/**
 * Retrieves an overview of the blog's statistics.
 *
 * @returns An object containing the total number of views,
 * posts, published posts, unpublished posts, and users.
 */
async getOverview() {
    const totalViews = await this.postViewEventRepository.count();

    const totalPosts = await this.postRepository.count();

    const publishedPosts = await this.postRepository.count({
        where: {
            isPublished: true,
        },
    });
    const  unpublishedPosts = await this.postRepository.count({
        where: {
            isPublished: false,
        },
    });

    const totalUsers = await this.userRepository.count()

    return {
        totalViews,
        totalPosts,
        publishedPosts,
        totalUsers,
        unpublishedPosts,
    };

}




/**
 * 
 * @param startDate 
 * @param endDate 
 * @returns  @returns An array of published posts containing their IDs, titles,
 * and total view counts.
 */
async getPopularPosts(
    startDate?: string,
    endDate?: string,
) {
    this.validateDateRange(startDate, endDate);

    const joinConditions = [
        '"view"."postId" = "post"."id"',
    ];

    const parameters: Record<string, string> = {};

    if (startDate !== undefined && endDate !== undefined) {
        joinConditions.push(
        '"view"."viewDate" BETWEEN :startDate AND :endDate',
        );

        parameters.startDate = startDate;
        parameters.endDate = endDate;
    }

    return this.postRepository
        .createQueryBuilder('post')
        .leftJoin(
        'post_view_event',
        'view',
        joinConditions.join(' AND '),
        parameters,
    )
        .select('post.id', 'postId')
        .addSelect('post.title', 'title')
        .addSelect('COUNT(view.id)', 'totalViews')
        .where('post.isPublished = :isPublished', {
        isPublished: true,
    })
        .groupBy('post.id')
        .addGroupBy('post.title')
        .orderBy('"totalViews"', 'DESC')
        .getRawMany();
}




/**
 * Retrieves statistics for a specific post
 * @param postId 
 * @param startDate 
 * @param endDate 
 * @returns The post details and total view count,
 *  including the date range when provided.
 */
async getPostStats(postId: number,startDate?:string,endDate?:string) {

    this.validateDateRange(startDate,endDate);

    const post = await this.postRepository.findOne({
        where: { id: postId },
        select: {
            id: true,
            title: true,
            isPublished: true,
        },
    });

    if (!post) {
        throw new NotFoundException('Post not found');
    }

     const totalViews = await this.postViewEventRepository.count({
        where: {
        postId,
        ...(startDate !== undefined && endDate !== undefined
            ? { viewDate: Between(startDate, endDate) }
            : {}),
        },
  });

    return {
        postId: post.id,
        title: post.title,
        isPublished: post.isPublished,
        totalViews,
        ...(startDate !== undefined && endDate !== undefined
        ? { startDate, endDate }
        : {}),
    };

}



/**
 * Retrieves daily view counts
 * @param startDate 
 * @param endDate 
 * @returns  A list of daily view counts
 */
async getDailyViews(
  startDate?: string,
  endDate?: string,
) {
  this.validateDateRange(startDate, endDate);

  const query = this.postViewEventRepository
    .createQueryBuilder('view')
    .select('view.viewDate', 'date')
    .addSelect('COUNT(view.id)', 'views');

  if (startDate !== undefined && endDate !== undefined) {
    query.where(
      'view.viewDate BETWEEN :startDate AND :endDate',
      { startDate, endDate },
    );
  }

  return query
    .groupBy('view.viewDate')
    .orderBy('view.viewDate', 'ASC')
    .getRawMany();
}

}
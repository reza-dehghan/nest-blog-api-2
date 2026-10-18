
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { inject } from 'vitest';
import { PostViewEvent } from './entities/post-view-event.entity.js';
import { Repository } from 'typeorm';
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

async getPopularPosts() {
    const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoin(
            'post_view_event',
            'view',
            '"view"."postId" = "post"."id"',
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

    return posts;
}


async getPostStats(postId: number) {
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
        where: { postId },
    });

    return {
        postId: post.id,
        title: post.title,
        isPublished: post.isPublished,
        totalViews,
    };
}


async getDailyViews() {
    return this.postViewEventRepository
        .createQueryBuilder('view')
        .select('view.viewDate', 'date')
        .addSelect('COUNT(view.id)', 'views')
        .groupBy('view.viewDate')
        .orderBy('view.viewDate', 'ASC')
        .getRawMany();
}


}
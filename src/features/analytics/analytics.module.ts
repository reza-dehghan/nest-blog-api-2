import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { PostViewEvent } from './entities/post-view-event.entity.js';
import { Post } from '../posts/entities/post.entity.js';
import { User } from '../entities/user.entity.js';
import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([PostViewEvent, Post,User]),
        AuthenticationModule

],

    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule {}
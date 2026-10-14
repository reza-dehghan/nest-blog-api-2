
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from './entities/post.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Tag } from '../tags/entities/tag.entity.js';

import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Category, Tag]),
    AuthenticationModule,

],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/database/database.module.js';
import { AuthModule } from './features/auth/auth.module.js';
import { CachingModule } from './infra/caching/caching.module.js';
import { PostsModule } from './features/posts/posts.module.js';
import { CategoriesModule } from './features/categories/categories.module.js';
import { TagsModule } from './features/tags/tags.module.js';
import { BlocksModule } from './features/blocks/blocks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    CachingModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    BlocksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/database/database.module.js';
import { AuthModule } from './features/auth/auth.module.js';
import { CachingModule } from './infra/caching/caching.module.js';
import { PostsModule } from './features/posts/posts.module.js';
import { CategoriesModule } from './features/categories/categories.module.js';
import { TagsModule } from './features/tags/tags.module.js';
import { BlocksModule } from './features/blocks/blocks.module.js';
import { AnalyticsModule } from './features/analytics/analytics.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './infra/http/filters/global-exception.filter.js';
import { RequestContextModule } from './core/request-context/request-context.module.js';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl:60_000,
        limit:10,
      }
    ]),
    DatabaseModule,
    AuthModule,
    CachingModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    BlocksModule,
    AnalyticsModule,
    RequestContextModule,
  ],
  controllers: [],
  providers: [
    {
      provide:APP_FILTER,
      useClass:GlobalExceptionFilter,
    },

  ],
})
export class AppModule {}

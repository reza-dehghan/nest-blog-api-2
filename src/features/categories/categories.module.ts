
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from './entities/category.entity.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category]),
    AuthenticationModule,
],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

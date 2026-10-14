
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tag } from './entities/tag.entity.js';
import { TagsController } from './tag.controller.js';
import { TagsService } from './tags.service.js';
import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';

@Module({
    imports: [TypeOrmModule.forFeature([Tag]),
    AuthenticationModule,
],
    controllers: [TagsController],
    providers: [TagsService],
    exports: [TagsService],
})
export class TagsModule {}

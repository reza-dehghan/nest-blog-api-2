
import { Module, } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media } from './entities/media.entity.js';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { S3StorageModule } from '../../infra/storage/s3/s3-storage.module.js';
import { Profile } from '../entities/profile.entity.js';
import { Post } from '../posts/entities/post.entity.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Media,Profile,Post]),
        S3StorageModule,
    ],
    controllers: [MediaController],
    providers: [MediaService],
    exports: [MediaService],
})
export class MediaModule {}

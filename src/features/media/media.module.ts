
import { Module, } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Media } from './entities/media.entity.js';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { Profile } from '../entities/profile.entity.js';
import { Post } from '../posts/entities/post.entity.js';
import { MinioStorageModule } from '../../infra/storage/s3/minio-storage.module.js';

import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';
@Module({
    imports: [
        TypeOrmModule.forFeature([Media,Profile,Post]),
        MinioStorageModule,
        AuthenticationModule,
    ],
    controllers: [MediaController],
    providers: [MediaService],
    exports: [MediaService],
})
export class MediaModule {}

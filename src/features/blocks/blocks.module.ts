
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity.js';
import { BlocksController } from './blocks.controller.js';
import { BlocksService } from './blocks.service.js';
import { Post } from '../posts/entities/post.entity.js';
import { AuthenticationModule } from '../../infra/authentication/authentication.module.js';
import { Media } from '../media/entities/media.entity.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Block,Post,Media]),
        AuthenticationModule,
],
   
    controllers: [BlocksController],
    providers: [BlocksService],
    exports: [BlocksService],
})
export class BlocksModule {}

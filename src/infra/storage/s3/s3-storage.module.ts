
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { STORAGE_PROVIDER } from '../../../core/storage/storage.constants.js';
import { S3StorageAdapter } from './s3-storage.adapter.js';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: STORAGE_PROVIDER,
            useClass: S3StorageAdapter,
        },
    ],
    exports: [STORAGE_PROVIDER],
})
export class S3StorageModule {}

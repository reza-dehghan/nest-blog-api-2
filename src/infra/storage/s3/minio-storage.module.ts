import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { STORAGE_PROVIDER } from '../../../core/storage/storage.constants.js';
import { MinioStorageAdapter } from './minio-storage.adapter.js';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: STORAGE_PROVIDER,
            useClass: MinioStorageAdapter,
        },
    ],
    exports: [STORAGE_PROVIDER],
})
export class MinioStorageModule {}
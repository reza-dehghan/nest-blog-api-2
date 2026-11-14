
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { StorageProvider } from '../../../core/storage/storage.interface.js';
import type {
    StorageReadAccess,
    StorageUploadInput,
} from '../../../core/storage/storage.types.js';

@Injectable()
export class S3StorageAdapter implements StorageProvider {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(configService: ConfigService) {
        this.s3Client = new S3Client({
            region: configService.getOrThrow<string>('AWS_REGION'),
        });

        this.bucketName =
            configService.getOrThrow<string>('S3_BUCKET');
    }

    async upload(input: StorageUploadInput): Promise<void> {
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: input.key,
                Body: input.body,
                ContentType: input.contentType,
            }),
        );
    }

    async delete(key: string): Promise<void> {
        await this.s3Client.send(
            new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }),
        );
    }

    async getReadAccess(
        key: string,
        expiresInSeconds: number,
    ): Promise<StorageReadAccess> {
        if (
            !Number.isInteger(expiresInSeconds) ||
            expiresInSeconds < 1 ||
            expiresInSeconds > 604800
        ) {
            throw new Error(
                'expiresInSeconds must be an integer between 1 and 604800.',
            );
        }

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const url = await getSignedUrl(
            this.s3Client,
            command,
            { expiresIn: expiresInSeconds },
        );

        return {
            type: 'redirect',
            url,
        };
    }
}

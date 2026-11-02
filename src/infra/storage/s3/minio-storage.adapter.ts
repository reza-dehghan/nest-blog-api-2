import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import type { StorageProvider } from '../../../core/storage/storage.interface.js';
import type {
    StorageReadAccess,
    StorageUploadInput,
} from '../../../core/storage/storage.types.js';


@Injectable()
export class MinioStorageAdapter implements StorageProvider {
    private readonly minioClient: Client;
    private readonly bucketName: string;


/**
 * Creates the MinIO client using environment settings.
 *
 * @param configService - Reads settings from the app configuration.
 */
    constructor(configService: ConfigService) {
    const port = Number(
        configService.getOrThrow<string>('MINIO_PORT'),
    );

    const useSSL =
        configService.getOrThrow<string>('MINIO_USE_SSL') === 'true';

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('MINIO_PORT must be a valid port number.');
    }

    this.minioClient = new Client({
        endPoint: configService.getOrThrow<string>('MINIO_ENDPOINT'),
        port,
        useSSL,
        accessKey: configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
        secretKey: configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    });

    this.bucketName =
        configService.getOrThrow<string>('MINIO_BUCKET');
}

/**
 * Uploads a file to the MinIO bucket.
 *
 * @param input - The file data, key, and content type.
 */
    async upload(input: StorageUploadInput): Promise<void> {

        await this.minioClient.putObject(
            this.bucketName,
            input.key,
            input.body,
            input.body.length,
            {
                'content-type': input.contentType,
            },
        );
        
    }




/**
 * Deletes a file from the MinIO bucket.
 *
 * @param key - The file key in the bucket.
 */
    async delete(key: string): Promise<void> {
        await this.minioClient.removeObject(
            this.bucketName,
            key,
        )
    }




/**
 * Creates a temporary URL to read a private file.
 *
 * @param key - The file key in the bucket.
 * @param expiresInSeconds - How long the URL stays valid, in seconds.
 * @returns A temporary URL for reading the file.
 */    
    async getReadAccess(key: string, expiresInSeconds: number): Promise<StorageReadAccess> {
        if (
            !Number.isInteger(expiresInSeconds)||
            expiresInSeconds < 1 ||
            expiresInSeconds > 604800
        ){
            throw new Error ('expiresInSeconds must be an integer between 1 and 604800.',);

        }

        const url = await this.minioClient.presignedGetObject(
            this.bucketName,
            key,
            expiresInSeconds,
        );

        return {
            type:'redirect',
            url,
        }
    }


}
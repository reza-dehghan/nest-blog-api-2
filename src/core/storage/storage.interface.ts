import type {
    StorageReadAccess,
    StorageUploadInput,
} from './storage.types.js';

export interface StorageProvider {
    upload(input: StorageUploadInput): Promise<void>;

    delete(key: string): Promise<void>;

    getReadAccess(
        key: string,
        expiresInSeconds: number,
    ): Promise<StorageReadAccess>;
}
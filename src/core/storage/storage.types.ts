import type { Readable } from 'node:stream';

export interface StorageUploadInput {
    key: string;
    body: Buffer;
    contentType: string;
}

export type StorageReadAccess =
    | {
          type: 'redirect';
          url: string;
      }
    | {
          type: 'stream';
          stream: Readable;
          contentType: string;
          contentLength?: number;
      };
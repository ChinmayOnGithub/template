/*
 * index.ts
 * Object storage upload authorization and signed URL generation adapter.
 * Enforces file size boundaries and MIME type validation for secure cloud uploads.
 */

import { BadRequestError } from "@/lib/api/errors";

export interface PresignedUploadResult {
  uploadUrl: string;
  fileKey: string;
  expiresInSeconds: number;
}

export interface StorageOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
}

const DEFAULT_MAX_SIZE = 1024 * 1024 * 50; // 50 MB
const DEFAULT_ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "application/pdf",
];

export interface StorageProvider {
  getPresignedUploadUrl: (
    fileKey: string,
    contentType: string,
    sizeBytes: number,
    options?: StorageOptions,
  ) => Promise<PresignedUploadResult>;
  deleteObject: (fileKey: string) => Promise<void>;
}

export class MockStorageProvider implements StorageProvider {
  async getPresignedUploadUrl(
    fileKey: string,
    contentType: string,
    sizeBytes: number,
    options: StorageOptions = {},
  ): Promise<PresignedUploadResult> {
    const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;
    const allowedMimes = options.allowedMimeTypes ?? DEFAULT_ALLOWED_MIMES;

    if (sizeBytes > maxSize) {
      throw new BadRequestError(
        `File size (${sizeBytes} bytes) exceeds maximum permitted limit (${maxSize} bytes).`,
      );
    }

    if (!allowedMimes.includes(contentType)) {
      throw new BadRequestError(`File type "${contentType}" is not an allowed upload format.`);
    }

    return {
      uploadUrl: `https://storage.mock.local/upload/${fileKey}?token=mock_upload_token`,
      fileKey,
      expiresInSeconds: 900,
    };
  }

  async deleteObject(_fileKey: string): Promise<void> {
    // Mock deletion
  }
}

export const storage = new MockStorageProvider();

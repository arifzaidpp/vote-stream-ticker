import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Provider } from './s3.provider';
import { LocalStorageProvider } from './local-storage.provider';
import { ImageProcessor } from './image-processor.service';
import * as path from 'path';
import * as crypto from 'crypto';
import * as mime from 'mime-types';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly allowedMimeTypes: readonly string[];
  private readonly maxFileSize: number;
  private readonly useLocalFallback: boolean;
  private readonly folderPath: string;

  constructor(
    private readonly s3Provider: S3Provider,
    private readonly localStorageProvider: LocalStorageProvider,
    private readonly imageProcessor: ImageProcessor,
    private readonly configService: ConfigService,
  ) {
    const s3Config = this.configService.get('storage.s3') || {};
    this.bucket = s3Config.bucket || '';
    this.publicUrl = s3Config.publicUrl || '';
    this.allowedMimeTypes =
      this.configService.get<string[]>('storage.allowedMimeTypes') || [];
    this.maxFileSize =
      this.configService.get<number>('storage.maxFileSize') || 5 * 1024 * 1024;
    this.folderPath =
      this.configService.get<string>('storage.paths.common') || 'uploads';
    this.useLocalFallback = process.env.USE_LOCAL_STORAGE_FALLBACK === 'true';
  }

  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
      mimeType.startsWith('application/pdf') ||
      mimeType.startsWith('text/') ||
      mimeType.includes('document')
    ) {
      return 'document';
    }
    return 'other';
  }

  async uploadFile(
    file: any,
    generateThumbnail: boolean = false,
    definedFolderPath: string = this.folderPath,
  ): Promise<{
    url: string;
    fileSize: number;
    mimeType: string;
    mediaType: string;
    thumbnails?: { [key: string]: string };
  }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds the limit of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    if (
      this.allowedMimeTypes.length > 0 &&
      !this.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    try {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const randomString = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();
      const filename = `${timestamp}-${randomString}${fileExtension}`;
      const key = `${definedFolderPath}/${filename}`;

      let fileBuffer = file.buffer;
      let thumbnails: { [key: string]: string } = {};

      if (this.imageProcessor.isImage(file.mimetype)) {
        fileBuffer = await this.imageProcessor.optimizeImage(
          fileBuffer,
          file.mimetype,
        );

        if (generateThumbnail) {
          const variants = await this.imageProcessor.generateVariants(
            file.buffer,
            key,
            file.mimetype,
          );
          for (const [name, variant] of Object.entries(variants)) {
            try {
              const uploaded = await this.uploadBuffer(
                variant.buffer,
                variant.key,
                variant.contentType,
              );
              thumbnails[name] = uploaded;
            } catch (variantError) {
              this.logger.error(
                `Failed to upload image variant ${name}: ${variantError.message}`,
                variantError.stack,
              );
            }
          }
        }
      }

      const fileUrl = await this.uploadBuffer(fileBuffer, key, file.mimetype);
      return {
        url: fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        mediaType: this.getMediaType(file.mimetype),
        thumbnails: Object.keys(thumbnails).length > 0 ? thumbnails : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  private async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    try {
      const result = await this.s3Provider.upload({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });
      return result.Location;
    } catch (s3Error) {
      if (this.useLocalFallback) {
        this.logger.warn(
          `S3 upload failed, falling back to local storage: ${s3Error.message}`,
        );
        try {
          const result = await this.localStorageProvider.upload({
            Key: key,
            Body: buffer,
            ContentType: contentType,
          });
          return result.Location;
        } catch (localError) {
          this.logger.error(
            `Local storage fallback failed: ${localError.message}`,
            localError.stack,
          );
          throw localError;
        }
      } else {
        throw s3Error;
      }
    }
  }

  /**
   * Delete a file from storage
   * @param fileUrl File URL to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the key from the URL
      const key = fileUrl.replace(`${this.publicUrl}/`, '');

      // Try to delete from S3
      try {
        await this.s3Provider.delete({
          Bucket: this.bucket,
          Key: key,
        });
      } catch (s3Error) {
        this.logger.warn(`S3 delete failed: ${s3Error.message}`);

        // If local fallback is enabled, try to delete from local storage too
        if (this.useLocalFallback) {
          try {
            await this.localStorageProvider.delete({ Key: key });
          } catch (localError) {
            this.logger.warn(
              `Local storage delete failed: ${localError.message}`,
            );
          }
        } else {
          throw s3Error;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Generate a signed URL for temporary access to a private file
   * @param key File key in S3
   * @param expiresIn Expiration time in seconds (default: 3600)
   * @returns Signed URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      return await this.s3Provider.getSignedUrl({
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Get a file from storage
   * @param key File key
   * @returns File buffer and content type
   */
  async getFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      // Try to get the file from S3
      try {
        // This is a placeholder as your current S3Provider doesn't have a getFile method
        // You would need to implement this in the S3Provider class
        throw new Error('S3 getFile not implemented');
      } catch (s3Error) {
        // If local fallback is enabled, try local storage
        if (this.useLocalFallback) {
          try {
            return await this.localStorageProvider.getFile(key);
          } catch (localError) {
            this.logger.error(
              `Local storage get failed: ${localError.message}`,
              localError.stack,
            );
            throw localError;
          }
        } else {
          throw s3Error;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * Upload file content from a base64 string
   * @param base64Data Base64 encoded file data
   * @param filename Filename
   * @param folderPath Path within the bucket
   * @param generateThumbnail Whether to generate a thumbnail for images
   * @returns Uploaded file URL and thumbnails if generated
   */
  async uploadBase64File(
    base64Data: string,
    filename: string,
    folderPath: string = 'uploads',
    generateThumbnail: boolean = false,
  ): Promise<{ url: string; thumbnails?: { [key: string]: string } }> {
    try {
      // Remove data URL prefix if exists (e.g., "data:image/png;base64,")
      const base64Content = base64Data.includes('base64,')
        ? base64Data.split('base64,')[1]
        : base64Data;

      // Determine MIME type from data URL or filename
      let contentType: string;
      if (base64Data.includes('data:')) {
        contentType = base64Data.split(';')[0].split(':')[1];
      } else {
        contentType = mime.lookup(filename) || 'application/octet-stream';
      }

      // Validate MIME type
      if (
        this.allowedMimeTypes.length > 0 &&
        !this.allowedMimeTypes.includes(contentType)
      ) {
        throw new BadRequestException(
          `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(
            ', ',
          )}`,
        );
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Content, 'base64');

      // Validate file size
      if (buffer.length > this.maxFileSize) {
        throw new BadRequestException(
          `File size exceeds the limit of ${this.maxFileSize / (1024 * 1024)}MB`,
        );
      }

      // Generate a unique filename
      const fileExtension = path.extname(filename).toLowerCase();
      const randomString = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${randomString}${fileExtension}`;
      const key = `${folderPath}/${uniqueFilename}`;

      // Process image if needed
      let fileBuffer = buffer;
      let thumbnails: { [key: string]: string } = {};

      if (
        (generateThumbnail || this.imageProcessor.isEnabled()) &&
        this.imageProcessor.isImage(contentType)
      ) {
        // Optimize the original image
        fileBuffer = await this.imageProcessor.optimizeImage(
          fileBuffer,
          contentType,
        );

        // Generate thumbnails
        const variants = await this.imageProcessor.generateVariants(
          buffer,
          key,
          contentType,
        );

        // Upload each variant
        for (const [name, variant] of Object.entries(variants)) {
          try {
            const uploaded = await this.uploadBuffer(
              variant.buffer,
              variant.key,
              variant.contentType,
            );
            thumbnails[name] = uploaded;
          } catch (variantError) {
            this.logger.error(
              `Failed to upload image variant ${name}: ${variantError.message}`,
              variantError.stack,
            );
          }
        }
      }

      // Upload to storage
      const fileUrl = await this.uploadBuffer(fileBuffer, key, contentType);

      return {
        url: fileUrl,
        thumbnails: Object.keys(thumbnails).length > 0 ? thumbnails : undefined,
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload base64 file: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to upload base64 file: ${error.message}`);
    }
  }
}

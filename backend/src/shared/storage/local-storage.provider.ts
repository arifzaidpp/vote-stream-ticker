import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class LocalStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly storagePath: string;
  private readonly publicPath: string;

  constructor(private readonly configService: ConfigService) {
    // Get storage path from config or use default
    this.storagePath = process.env.LOCAL_STORAGE_PATH || './uploads';
    this.publicPath = process.env.LOCAL_STORAGE_PUBLIC_URL || '/uploads';

    // Create storage directory if it doesn't exist
    this.ensureDirectoryExists(this.storagePath);
  }

  /**
   * Upload a file to local storage
   * @param params Upload parameters
   * @returns Promise resolving to upload result with location URL
   */
  async upload(params: {
    Key: string;
    Body: Buffer | string;
    ContentType?: string;
  }): Promise<{ Location: string }> {
    try {
      const filePath = path.join(this.storagePath, params.Key);
      
      // Ensure the directory exists
      const dirPath = path.dirname(filePath);
      this.ensureDirectoryExists(dirPath);
      
      // Write the file
      if (typeof params.Body === 'string') {
        await fs.promises.writeFile(filePath, params.Body);
      } else {
        await fs.promises.writeFile(filePath, params.Body);
      }
      
      return {
        Location: `${this.publicPath}/${params.Key}`
      };
    } catch (error) {
      this.logger.error(`Failed to upload file locally: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a file from local storage
   * @param params Delete parameters
   * @returns Promise resolving to delete result
   */
  async delete(params: { Key: string }): Promise<void> {
    try {
      const filePath = path.join(this.storagePath, params.Key);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      } else {
        this.logger.warn(`File not found for deletion: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file locally: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get file from local storage
   * @param key File key path
   * @returns File buffer and content type
   */
  async getFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const filePath = path.join(this.storagePath, key);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${key}`);
      }
      
      const buffer = await fs.promises.readFile(filePath);
      
      // Try to determine content type from extension
      const ext = path.extname(key).toLowerCase();
      let contentType = 'application/octet-stream';
      
      // Simple MIME type mapping
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
      };
      
      if (ext in mimeTypes) {
        contentType = mimeTypes[ext];
      }
      
      return { buffer, contentType };
    } catch (error) {
      this.logger.error(`Failed to get file from local storage: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Ensure a directory exists, creating it if necessary
   * @param dirPath Directory path
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        this.logger.log(`Created directory: ${dirPath}`);
      } catch (error) {
        this.logger.error(`Failed to create directory: ${error.message}`, error.stack);
        throw error;
      }
    }
  }
}
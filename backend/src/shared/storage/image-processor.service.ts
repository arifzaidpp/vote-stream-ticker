import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as path from 'path';

export interface ImageVariant {
  buffer: Buffer;
  key: string;
  contentType: string;
}

@Injectable()
export class ImageProcessor {
  private readonly logger = new Logger(ImageProcessor.name);
  private readonly enabled: boolean;
  private readonly thumbnailWidth: number;
  private readonly thumbnailHeight: number;
  private readonly quality: number;

  constructor(private readonly configService: ConfigService) {
    const imageConfig = this.configService.get('storage.imageProcessing') || {};
    this.enabled = imageConfig.enabled || false;
    this.thumbnailWidth = imageConfig.thumbnailWidth || 300;
    this.thumbnailHeight = imageConfig.thumbnailHeight || 300;
    this.quality = imageConfig.quality || 80;
  }

  /**
   * Check if image processing is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if a file is an image
   * @param mimeType MIME type of the file
   */
  isImage(mimeType: string): boolean {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType);
  }

  /**
   * Generate image variants (e.g., thumbnails) from the original image
   * @param buffer Original image buffer
   * @param key Original file key
   * @param mimeType Image MIME type
   */
  async generateVariants(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<{ [name: string]: ImageVariant }> {
    if (!this.enabled || !this.isImage(mimeType)) {
      return {};
    }

    try {
      const variants: { [name: string]: ImageVariant } = {};
      const parsedPath = path.parse(key);
      const outputFormat = this.getOutputFormat(mimeType);
      
      // Generate thumbnail
      const thumbnailKey = `${parsedPath.dir}/${parsedPath.name}-thumbnail${parsedPath.ext}`;
      const thumbnailBuffer = await this.resizeImage(
        buffer,
        this.thumbnailWidth,
        this.thumbnailHeight,
        outputFormat,
      );
      
      variants.thumbnail = {
        buffer: thumbnailBuffer,
        key: thumbnailKey,
        contentType: mimeType,
      };
      
      return variants;
    } catch (error) {
      this.logger.error(`Failed to generate image variants: ${error.message}`, error.stack);
      return {};
    }
  }

  /**
   * Optimize an image for web
   * @param buffer Image buffer
   * @param mimeType Image MIME type
   */
  async optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    if (!this.enabled || !this.isImage(mimeType)) {
      return buffer;
    }

    try {
      const outputFormat = this.getOutputFormat(mimeType);
      const sharpInstance = sharp(buffer);

      // Apply format-specific optimizations
      switch (outputFormat) {
        case 'jpeg':
          return await sharpInstance.jpeg({ quality: this.quality }).toBuffer();
        case 'png':
          return await sharpInstance.png({ quality: this.quality }).toBuffer();
        case 'webp':
          return await sharpInstance.webp({ quality: this.quality }).toBuffer();
        default:
          return buffer;
      }
    } catch (error) {
      this.logger.error(`Failed to optimize image: ${error.message}`, error.stack);
      return buffer;
    }
  }

  /**
   * Resize an image
   * @param buffer Image buffer
   * @param width Target width
   * @param height Target height
   * @param format Output format (jpeg, png, webp)
   */
  private async resizeImage(
    buffer: Buffer,
    width: number,
    height: number,
    format: string,
  ): Promise<Buffer> {
    try {
      const sharpInstance = sharp(buffer).resize({
        width,
        height,
        fit: 'inside',
        withoutEnlargement: true,
      });

      // Apply format-specific output
      switch (format) {
        case 'jpeg':
          return await sharpInstance.jpeg({ quality: this.quality }).toBuffer();
        case 'png':
          return await sharpInstance.png({ quality: this.quality }).toBuffer();
        case 'webp':
          return await sharpInstance.webp({ quality: this.quality }).toBuffer();
        default:
          return await sharpInstance.toBuffer();
      }
    } catch (error) {
      this.logger.error(`Failed to resize image: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get output format from MIME type
   * @param mimeType MIME type
   */
  private getOutputFormat(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpeg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'jpeg';
    }
  }
}
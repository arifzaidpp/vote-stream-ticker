import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { 
  GetObjectCommand, 
  DeleteObjectCommand, 
  PutObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Provider {
  private s3: S3;
  private bucket: string;
  private readonly logger = new Logger(S3Provider.name);

  constructor(private configService: ConfigService) {
    const s3Config = this.configService.get('storage.s3');

    if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
      this.logger.warn('AWS S3 credentials are not configured properly');
    }

    this.s3 = new S3({
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      region: s3Config.region,
    });

    this.bucket = s3Config.bucket;
  }

  /**
   * Upload a file to S3
   * @param params Upload parameters
   * @returns Promise resolving to upload result
   */
  async upload(params: {
    Bucket: string;
    Key: string;
    Body: Buffer | string;
    ContentType?: string;
    ACL?: string;
  }): Promise<any> {
    const uploadParams = {
      ...params,
      // Convert string ACL to proper ObjectCannedACL
      ACL: params.ACL as any
    };
    
    const upload = new Upload({
      client: this.s3,
      params: uploadParams
    });

    return upload.done();
  }

  /**
   * Delete a file from S3
   * @param params Delete parameters
   * @returns Promise resolving to delete result
   */
  async delete(params: { Bucket: string; Key: string }): Promise<any> {
    return this.s3.send(new DeleteObjectCommand(params));
  }

  /**
   * Generate a signed URL for temporary access
   * @param params Signed URL parameters
   * @returns Promise resolving to signed URL
   */
  async getSignedUrl(params: {
    Bucket: string;
    Key: string;
    Expires: number;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: params.Bucket,
      Key: params.Key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: params.Expires });
  }

  /**
   * Get file from S3
   * @param key File key in S3
   * @returns File buffer and content type
   */
  async getFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      const response = await this.s3.send(command);
      
      // Convert readable stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      
      return {
        buffer: Buffer.concat(chunks),
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      this.logger.error(`Failed to get file from S3: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   * @param key File key in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      await this.s3.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get S3 client instance
   * @returns S3 client
   */
  getS3Client(): S3 {
    return this.s3;
  }
}
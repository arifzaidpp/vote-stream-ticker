import {
    Controller,
    Post,
    Get,
    Delete,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Body,
    Param,
    Query,
    UseGuards,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
    Logger,
    Res,
  } from '@nestjs/common';
  import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
  import { Response } from 'express';
  import * as path from 'path';
  import { StorageService } from './storage.service';
  import { ConfigService } from '@nestjs/config';
  // Import authentication guards if needed
  // import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  // import { RolesGuard } from '../auth/guards/roles.guard';
  // import { Roles } from '../auth/decorators/roles.decorator';
  // import { CurrentUser } from '../auth/decorators/current-user.decorator';
  
  @Controller('storage')
  export class StorageController {
    private readonly logger = new Logger(StorageController.name);
    private readonly maxFileSize: number;
    private readonly maxFiles: number;
    private readonly allowedMimeTypes: string[];
  
    constructor(
      private readonly storageService: StorageService,
      private readonly configService: ConfigService,
    ) {
      // Load configuration
      this.maxFileSize = this.configService.get<number>('storage.maxFileSize') || 5 * 1024 * 1024;
      this.maxFiles = this.configService.get<number>('storage.maxFiles') || 10;
      this.allowedMimeTypes = this.configService.get<string[]>('storage.allowedMimeTypes') || [];
    }
  
    /**
     * Upload a single file
     */
    @Post('upload')
    // @UseGuards(JwtAuthGuard) // Uncomment to require authentication
    @UseInterceptors(
      FileInterceptor('file', {
        limits: {
          fileSize: 5 * 1024 * 1024, // 10MB limit (this will be further validated in the service)
        },
      }),
    )
    async uploadFile(
      @UploadedFile() file: any,
      @Query('path') path: string = 'uploads',
      @Query('generateThumbnail') generateThumbnail: string,
      // @CurrentUser() user: any, // Uncomment to get the current user
    ) {
      try {
        if (!file) {
          throw new BadRequestException('No file uploaded');
        }
  
        // Convert query param to boolean
        const shouldGenerateThumbnail = generateThumbnail === 'true';
  
        // Upload the file
        const result = await this.storageService.uploadFile(
          file,
          shouldGenerateThumbnail,
          path,
        );
  
        return {
          success: true,
          message: 'File uploaded successfully',
          data: result,
        };
      } catch (error) {
        this.logger.error(`Error uploading file: ${error.message}`, error.stack);
        
        if (error instanceof BadRequestException) {
          throw error;
        }
        
        throw new InternalServerErrorException('Failed to upload file');
      }
    }
  
    /**
     * Upload multiple files
     */
    @Post('upload-multiple')
    // @UseGuards(JwtAuthGuard) // Uncomment to require authentication
    @UseInterceptors(
      FilesInterceptor('files', 10, { // 10 is the max count, adjust as needed
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
        },
      }),
    )
    async uploadMultipleFiles(
      @UploadedFiles() files: any[],
      @Query('path') path: string = 'uploads',
      @Query('generateThumbnail') generateThumbnail: string,
      // @CurrentUser() user: any, // Uncomment to get the current user
    ) {
      try {
        if (!files || files.length === 0) {
          throw new BadRequestException('No files uploaded');
        }
  
        if (files.length > this.maxFiles) {
          throw new BadRequestException(`Maximum ${this.maxFiles} files allowed`);
        }
  
        // Convert query param to boolean
        const shouldGenerateThumbnail = generateThumbnail === 'true';
  
        // Upload each file
        const results = await Promise.all(
          files.map((file) =>
            this.storageService.uploadFile(file, shouldGenerateThumbnail, path),
          ),
        );
  
        return {
          success: true,
          message: 'Files uploaded successfully',
          data: results,
        };
      } catch (error) {
        this.logger.error(`Error uploading files: ${error.message}`, error.stack);
        
        if (error instanceof BadRequestException) {
          throw error;
        }
        
        throw new InternalServerErrorException('Failed to upload files');
      }
    }
  
    /**
     * Upload a file from base64 data
     */
    @Post('upload-base64')
    // @UseGuards(JwtAuthGuard) // Uncomment to require authentication
    async uploadBase64(
      @Body() data: { base64Data: string; filename: string; path?: string; generateThumbnail?: boolean },
      // @CurrentUser() user: any, // Uncomment to get the current user
    ) {
      try {
        if (!data.base64Data) {
          throw new BadRequestException('No base64 data provided');
        }
  
        if (!data.filename) {
          throw new BadRequestException('Filename is required');
        }
  
        // Upload the file
        const result = await this.storageService.uploadBase64File(
          data.base64Data,
          data.filename,
          data.path || 'uploads',
          data.generateThumbnail,
        );
  
        return {
          success: true,
          message: 'File uploaded successfully',
          data: result,
        };
      } catch (error) {
        this.logger.error(`Error uploading base64 file: ${error.message}`, error.stack);
        
        if (error instanceof BadRequestException) {
          throw error;
        }
        
        throw new InternalServerErrorException('Failed to upload file');
      }
    }
  
    /**
     * Delete a file
     */
    @Delete(':url')
    // @UseGuards(JwtAuthGuard) // Uncomment to require authentication
    async deleteFile(
      @Param('url') fileUrl: string,
      // @CurrentUser() user: any, // Uncomment to get the current user
    ) {
      try {
        if (!fileUrl) {
          throw new BadRequestException('File URL is required');
        }
  
        // URL decode the parameter
        const decodedUrl = decodeURIComponent(fileUrl);
  
        // Delete the file
        await this.storageService.deleteFile(decodedUrl);
  
        return {
          success: true,
          message: 'File deleted successfully',
        };
      } catch (error) {
        this.logger.error(`Error deleting file: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to delete file');
      }
    }
  
    /**
     * Get a file (for private files)
     */
    @Get('file/:key')
    // @UseGuards(JwtAuthGuard) // Uncomment to require authentication
    async getFile(
      @Param('key') key: string,
      @Res() res: Response,
      // @CurrentUser() user: any, // Uncomment to get the current user
    ) {
      try {
        if (!key) {
          throw new BadRequestException('File key is required');
        }
  
        // URL decode the parameter
        const decodedKey = decodeURIComponent(key);
  
        try {
          // Get the file
          const { buffer, contentType } = await this.storageService.getFile(decodedKey);
  
          // Send the file
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `inline; filename="${path.basename(decodedKey)}"`);
          res.send(buffer);
        } catch (error) {
          throw new NotFoundException('File not found');
        }
      } catch (error) {
        this.logger.error(`Error getting file: ${error.message}`, error.stack);
        
        if (error instanceof BadRequestException || error instanceof NotFoundException) {
          throw error;
        }
        
        throw new InternalServerErrorException('Failed to get file');
      }
    }
  
    /**
     * Get a signed URL for temporary access
     */
    @Get('signed-url/:key')
    // @UseGuards(JwtAuthGuard) // Uncomment to require authentication
    async getSignedUrl(
      @Param('key') key: string,
      @Query('expires') expires: string,
      // @CurrentUser() user: any, // Uncomment to get the current user
    ) {
      try {
        if (!key) {
          throw new BadRequestException('File key is required');
        }
  
        // URL decode the parameter
        const decodedKey = decodeURIComponent(key);
        
        // Parse expires to number (default to 1 hour)
        const expiresIn = expires ? parseInt(expires, 10) : 3600;
  
        // Get the signed URL
        const signedUrl = await this.storageService.getSignedUrl(decodedKey, expiresIn);
  
        return {
          success: true,
          data: {
            url: signedUrl,
            expiresIn,
          },
        };
      } catch (error) {
        this.logger.error(`Error generating signed URL: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to generate signed URL');
      }
    }
  }
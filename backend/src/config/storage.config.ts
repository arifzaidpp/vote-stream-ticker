import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  // AWS S3 configuration
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1',
    bucket: process.env.AWS_S3_BUCKET,
    publicUrl:
      process.env.AWS_S3_PUBLIC_URL ||
      `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`,
  },

  // Upload limits
  maxFileSize:
    parseInt(process.env.MAX_FILE_SIZE as string, 10) || 5 * 1024 * 1024, // 5MB in bytes
  maxFiles: parseInt(process.env.MAX_FILES as string, 10) || 10,

  // Allowed file types
  allowedMimeTypes: process.env.ALLOWED_MIME_TYPES
    ? process.env.ALLOWED_MIME_TYPES.split(',').map((type) => type.trim())
    : [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'audio/mpeg',
        'video/mp4',
      ],

  // Storage paths
  paths: {
    featureImages:
      process.env.STORAGE_PATH_FEATURE_IMAGES || 'uploads/features',
    userAvatars:
      process.env.STORAGE_PATH_USER_AVATARS || 'uploads/user-avatars',
    adminAvatars:
      process.env.STORAGE_PATH_ADMIN_AVATARS || 'uploads/user-avatars',
    contentMedia:
      process.env.STORAGE_PATH_CONTENT_MEDIA || 'uploads/content-media',
    common: process.env.STORAGE_PATH_NAME || 'uploads',
  },

  // Image processing
  imageProcessing: {
    enabled: process.env.IMAGE_PROCESSING_ENABLED === 'true',
    thumbnailWidth: parseInt(process.env.THUMBNAIL_WIDTH as string, 10) || 300,
    thumbnailHeight:
      parseInt(process.env.THUMBNAIL_HEIGHT as string, 10) || 300,
    quality: parseInt(process.env.IMAGE_QUALITY as string, 10) || 80,
  },
}));

import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { User as UserModel } from '../models/user.model';
import { PendingUser } from '../models/pending-user.model';
import { LoginDto } from '../dto/user/login.input';
import { CreateUserDto } from '../dto/user/create-user.input';
import { SetPasswordInput } from '../dto/set-password.input';
import { ChangePasswordInput } from '../dto/change-password.input';
import { ResetPasswordDto } from '../dto/reset-password.input';
import { ForgotPasswordDto } from '../dto/forgot-password.input';
import { VerifyEmailDto } from '../dto/verify-email.input';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CacheService } from 'src/shared/cache/cache.service';
import { MailService } from 'src/shared/mail/mail.service';
import { SuccessResponse } from 'src/common/models/pagination.model';
import { withErrorHandling } from 'src/common/utils/application-error.utils';
import { cacheKeys } from 'src/shared/cache/cache-keys.util';
import { hashPassword, verifyPassword } from 'src/common/utils/password.util';
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
  validateJwtToken,
} from 'src/common/utils/token.util';
import {
  createUserSession,
  getUserSessionsCount,
  invalidateUserSession,
} from 'src/common/utils/session.util';
import { PrismaClient, User } from '@prisma/client';
import { transformDates } from 'src/common/utils/date.utils';
import { JwtService } from '@nestjs/jwt';

/**
 * Interface for password reset data
 */
interface IResetData {
  userId: number;
  email: string;
  createdAt: Date;
}

/**
 * Service to handle User authentication operations
 * Uses Prisma as ORM, implements caching strategies, and manages user authentication
 */
@Injectable()
export class UserAuthService {
  /**
   * Initialize the service with required dependencies
   */
  private readonly logger = new Logger(UserAuthService.name);
  private readonly ttl = 7 * 24 * 60 * 60; // 1 week
  private readonly verificationTtl = 24 * 60 * 60; // 24 hours
  private readonly passwordResetTtl = 60 * 60; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly emailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * Stores pending user in cache and sends verification email
   *
   * @param input - User registration data
   * @param req - Express request object
   * @returns Promise with success response
   * @throws ConflictException if user already exists
   */
  async register(input: CreateUserDto, req: Request): Promise<SuccessResponse> {
    const { email, password, profile } = input;

    return withErrorHandling(
      async () => {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (existingUser) {
          throw new ConflictException('User with this email already exists');
        }

        // Check if a pending verification exists
        const cacheKey = cacheKeys.pendingVerification(email);
        const pending = await this.cacheService.get(cacheKey);

        if (pending) {
          throw new ConflictException(
            'A pending verification already exists for this email',
          );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Generate verification token
        const secret = this.configService.get('auth.emailVerification.secret');
        const expiresIn = this.configService.get(
          'auth.emailVerification.expiresIn',
        );
        const verificationToken = generateEmailVerificationToken(
          email,
          secret,
          expiresIn,
        );

        // Store pending user in cache
        const pendingUser: PendingUser = {
          email,
          passwordHash,
          fullName: profile?.fullName || '',
          verificationToken,
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          createdAt: new Date(),
        };

        await this.cacheService.set(
          cacheKey,
          pendingUser,
          this.verificationTtl,
        );

        // Send verification email
        try {
          const mailed = await this.emailService.sendVerificationEmail(
            pendingUser,
            verificationToken,
          );

          if (!mailed) {
            throw new InternalServerErrorException(
              'Failed to send verification email',
            );
          }

          return {
            success: true,
            message:
              'Registration successful. Please check your email to verify your account.',
          };
        } catch (error) {
          // Clean up cache if email fails
          await this.cacheService.delete(cacheKey);

          this.logger.error('Failed to send verification email', {
            error: error.message,
            email,
          });

          throw new InternalServerErrorException(
            'Failed to send verification email',
          );
        }
      },
      {
        entityName: 'user',
        operation: 'register',
      },
    );
  }

  /**
   * Login user
   * Verifies credentials, checks session limits, creates a session
   *
   * @param input - Login credentials
   * @param req - Express request object
   * @param res - Optional Express response object for setting cookies
   * @returns Promise with user object
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(
    input: LoginDto,
    req: Request,
    res?: Response,
  ): Promise<{ user: UserModel }> {
    return withErrorHandling(
      async () => {
        const { email, password } = input;

        // Find user by email
        const user = await this.prisma.user.findUnique({
          where: { email },
          include: {
            profile: true,
          },
        });

        if (!user || !user.passwordHash) {
          throw new UnauthorizedException('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await verifyPassword(
          user.passwordHash,
          password,
        );
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid email or password');
        }

        // Begin transaction for session handling
        const result = await this.prisma.$transaction(async (tx) => {
          // Check session limits (max 2 active sessions)
          // const activeSessions = await getUserSessionsCount(
          //   tx as PrismaClient,
          //   user.id,
          // );
          // if (activeSessions >= 2) {
          //   throw new UnauthorizedException(
          //     'Maximum number of active sessions reached. Please log out from another device.',
          //   );
          // }

          // Create a new session
          const sessionId = await createUserSession(
            tx as PrismaClient,
            user.id,
            req.ip || 'unknown',
            (req.headers['user-agent'] as string) || 'unknown',
          );

          return { user, sessionId };
        });

        // Set session cookie if response object is provided
        if (res) {
          res.cookie('sessionId', result.sessionId, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });
        }

        // Generate JWT token with role information
      const payload = { 
        sub: result.user.id, 
        username: result.user.email,
        role: result.user.role  // Make sure user has a role property
      };
      
      const token = this.jwtService.sign(payload);

      console.log('token', token);
      

        // Cache the user data
        await this.cacheService.set(cacheKeys.user(user.id), user, this.ttl);

        // Remove sensitive data
        const { passwordHash, ...userWithoutPassword } = result.user;
        return { user: userWithoutPassword as UserModel, token };
      },
      {
        entityName: 'user',
        operation: 'login',
      },
    );
  }

  /**
   * Logout user
   * Invalidate session and clear cookies
   *
   * @param sessionId - ID of the session to invalidate
   * @param res - Optional Express response object for clearing cookies
   * @returns Promise with success response
   */
  async logout(sessionId: string, res?: Response): Promise<SuccessResponse> {
    return withErrorHandling(
      async () => {
        await this.prisma.$transaction(async (tx) => {
          await invalidateUserSession(tx as PrismaClient, sessionId);
        });

        // Clear session cookie if response object is provided
        if (res) {
          res.clearCookie('sessionId');
        }

        return {
          success: true,
          message: 'Logged out successfully',
        };
      },
      {
        entityName: 'user',
        operation: 'logout',
      },
    );
  }

  /**
   * Get active user sessions count
   *
   * @param userId - ID of the user to check sessions for
   * @returns Promise with session count
   */
  async getUserSessionsCount(userId: number): Promise<number> {
    return withErrorHandling(
      async () => {
        return await getUserSessionsCount(this.prisma, userId);
      },
      {
        entityName: 'user',
        operation: 'getSessionsCount',
      },
    );
  }

  /**
   * Verify email with token
   * Validates token and creates user in database
   *
   * @param input - Email verification data with token
   * @returns Promise with success response and user data
   * @throws BadRequestException if token is invalid
   */
  async verifyEmail(
    input: VerifyEmailDto,
  ): Promise<{ success: boolean; user: Partial<User> }> {
    return withErrorHandling(
      async () => {
        const { token } = input;

        // Validate the token
        const secret = this.configService.get('auth.emailVerification.secret');
        const validated = validateJwtToken(token, secret);

        if (typeof validated === 'string' || !validated?.email) {
          throw new BadRequestException('Invalid token');
        }

        const email = validated.email;

        // Find the pending user
        const pendingKey = cacheKeys.pendingVerification(email);
        const pendingUser =
          await this.cacheService.get<PendingUser>(pendingKey);

        if (!pendingUser || !email) {
          throw new BadRequestException(
            'Invalid or expired verification token',
          );
        }

        // Begin transaction for user creation
        const result = await this.prisma.$transaction(async (tx) => {
          // Check if user already exists (might have been verified in another tab)
          const existingUser = await tx.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            throw new ConflictException(
              'Account already verified. Please login.',
            );
          }

          // Create user with profile and preferences
          const user = await tx.user.create({
            data: {
              email,
              passwordHash: pendingUser.passwordHash,
              profile: {
                create: {
                  fullName: pendingUser.fullName,
                },
              },
            },
            include: {
              profile: true,
            },
          });

          return user;
        });

        // After transaction completes
        await this.invalidateCache();

        // Delete pending verification from cache
        await this.cacheService.delete(cacheKeys.pendingVerification(email));

        // Cache the new user
        await this.cacheService.set(
          cacheKeys.user(result.id),
          result,
          this.ttl,
        );

        // Remove sensitive data
        const { passwordHash, ...userWithoutPassword } = result;

        return {
          success: true,
          user: userWithoutPassword,
        };
      },
      {
        entityName: 'user',
        operation: 'verifyEmail',
      },
    );
  }

  /**
   * Resend verification email
   *
   * @param email - Email to resend verification for
   * @returns Promise with success response
   * @throws NotFoundException if no pending verification exists
   */
  async resendVerificationEmail(email: string): Promise<SuccessResponse> {
    return withErrorHandling(
      async () => {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new ConflictException(
            'User with this email already exists and is verified',
          );
        }

        // Check if a pending verification exists
        const pendingKey = cacheKeys.pendingVerification(email);
        const pending = await this.cacheService.get<PendingUser>(pendingKey);

        if (!pending) {
          throw new NotFoundException(
            'No pending verification found for this email',
          );
        }

        // Generate new verification token
        const secret = this.configService.get('auth.emailVerification.secret');
        const expiresIn = this.configService.get(
          'auth.emailVerification.expiresIn',
        );

        const verificationToken = generateEmailVerificationToken(
          email,
          secret,
          expiresIn,
        );

        // Update pending user in cache with new token
        const updatedPending: PendingUser = {
          ...pending,
          verificationToken,
        };

        await this.cacheService.set(
          pendingKey,
          updatedPending,
          this.verificationTtl,
        );

        // Send verification email
        try {
          await this.emailService.sendVerificationEmail(
            pending,
            verificationToken,
          );
        } catch (error) {
          this.logger.error('Failed to resend verification email', {
            error: error.message,
            email,
          });

          throw new InternalServerErrorException(
            'Failed to send verification email',
          );
        }

        return {
          success: true,
          message:
            'Verification email has been resent. Please check your inbox.',
        };
      },
      {
        entityName: 'user',
        operation: 'resendVerification',
      },
    );
  }

  /**
   * Request password reset email
   *
   * @param input - Password reset request data with email
   * @returns Promise with success response
   */
  async requestPasswordReset(
    input: ForgotPasswordDto,
  ): Promise<SuccessResponse> {
    return withErrorHandling(
      async () => {
        const { email } = input;

        // Find user by email
        const user = await this.prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // We don't want to reveal whether an email exists or not for security reasons
          return {
            success: true,
            message:
              'If an account with this email exists, a password reset link has been sent.',
          };
        }

        // Generate reset token
        const userId = user.id;
        const secret = this.configService.get('passwordReset.secret');
        const expiresIn = this.configService.get('passwordReset.expiresIn');

        const resetToken = generatePasswordResetToken(
          userId,
          secret,
          expiresIn,
        );

        // Store reset token in cache
        const resetKey = cacheKeys.passwordReset(resetToken);
        const resetData: IResetData = {
          userId,
          email,
          createdAt: new Date(),
        };

        await this.cacheService.set(resetKey, resetData, this.passwordResetTtl);

        // Send password reset email
        try {
          await this.emailService.sendPasswordResetEmail(user, resetToken);
        } catch (error) {
          // Delete from cache if email fails
          await this.cacheService.delete(resetKey);

          this.logger.error('Failed to send password reset email', {
            error: error.message,
            userId,
          });

          throw new InternalServerErrorException(
            'Failed to send password reset email',
          );
        }

        return {
          success: true,
          message: 'Password reset link has been sent to your email.',
        };
      },
      {
        entityName: 'user',
        operation: 'requestPasswordReset',
      },
    );
  }

  /**
   * Reset password with token
   *
   * @param input - Password reset data with token and new password
   * @returns Promise with success response
   * @throws BadRequestException if token is invalid
   */
  async resetPassword(input: ResetPasswordDto): Promise<SuccessResponse> {
    return withErrorHandling(
      async () => {
        const { token, password } = input;

        // Find reset token in cache
        const resetKey = cacheKeys.passwordReset(token);
        const resetData = await this.cacheService.get<IResetData>(resetKey);

        // Validate the token
        const secret = this.configService.get('passwordReset.secret');
        const validated = validateJwtToken(token, secret);

        if (!resetData || !validated) {
          throw new BadRequestException(
            'Invalid or expired password reset token',
          );
        }

        // Begin transaction
        await this.prisma.$transaction(async (tx) => {
          // Hash new password
          const passwordHash = await hashPassword(password);

          // Update user password
          await tx.user.update({
            where: { id: resetData.userId },
            data: {
              passwordHash,
            },
          });
        });

        // Delete reset token from cache
        await this.cacheService.delete(resetKey);

        // Invalidate user cache
        await this.invalidateCache(resetData.userId);

        return {
          success: true,
          message:
            'Password has been reset successfully. You can now log in with your new password.',
        };
      },
      {
        entityName: 'user',
        operation: 'resetPassword',
      },
    );
  }

  /**
   * Change password when logged in
   *
   * @param userId - ID of the user changing password
   * @param input - Change password data with current and new password
   * @returns Promise with success response
   * @throws UnauthorizedException if current password is incorrect
   */
  async changePassword(
    userId: number,
    input: ChangePasswordInput,
  ): Promise<SuccessResponse> {
    return withErrorHandling(
      async () => {
        const { currentPassword, newPassword } = input;

        // Begin transaction
        await this.prisma.$transaction(async (tx) => {
          // Find user
          const user = await tx.user.findUnique({
            where: { id: userId },
          });

          if (!user || !user.passwordHash) {
            throw new NotFoundException(
              'User not found or has no password set',
            );
          }

          // Verify current password
          const isPasswordValid = await verifyPassword(
            user.passwordHash,
            currentPassword,
          );

          if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
          }

          // Hash new password
          const passwordHash = await hashPassword(newPassword);

          // Update user password
          await tx.user.update({
            where: { id: userId },
            data: {
              passwordHash,
            },
          });
        });

        // Invalidate user cache
        await this.invalidateCache(userId);

        return {
          success: true,
          message: 'Password changed successfully',
        };
      },
      {
        entityName: 'user',
        operation: 'changePassword',
      },
    );
  }

  /**
   * Set password for OAuth users who don't have a password yet
   *
   * @param userId - ID of the user setting password
   * @param input - Set password data with new password
   * @returns Promise with success response
   * @throws BadRequestException if user already has a password
   */
  async setPasswordForOAuthUser(
    userId: number,
    input: SetPasswordInput,
  ): Promise<SuccessResponse> {
    return withErrorHandling(
      async () => {
        const { password } = input;

        // Begin transaction
        await this.prisma.$transaction(async (tx) => {
          // Find user
          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true },
          });

          if (!user) {
            throw new NotFoundException('User not found');
          }

          if (user.passwordHash) {
            throw new BadRequestException(
              'User already has a password set. Please use change password instead.',
            );
          }

          // Hash password
          const passwordHash = await hashPassword(password);

          // Update user password
          await tx.user.update({
            where: { id: userId },
            data: {
              passwordHash,
            },
          });
        });

        // Invalidate user cache
        await this.invalidateCache(userId);

        return {
          success: true,
          message: 'Password set successfully',
        };
      },
      {
        entityName: 'user',
        operation: 'setPassword',
      },
    );
  }

  /**
   * Get current user profile
   *
   * @param userId - ID of the user to get profile for
   * @returns Promise with user object
   * @throws NotFoundException if user not found
   */
  async me(userId: number): Promise<Partial<User>> {
    return withErrorHandling(
      async () => {
        // Try to get from cache first
        const cachedUser = await this.cacheService.get<User>(
          cacheKeys.user(userId),
        );

        if (cachedUser) {
          // Remove sensitive data and transform dates
          const { passwordHash, ...userWithoutPassword } = cachedUser;
          return transformDates(userWithoutPassword);
        }

        // Get from database if not in cache
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
          },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        // Cache the user
        await this.cacheService.set(cacheKeys.user(userId), user, this.ttl);

        // Remove sensitive data
        const { passwordHash, ...userWithoutPassword } = user;

        return userWithoutPassword;
      },
      {
        entityName: 'user',
        operation: 'me',
      },
    );
  }

  /**
   * Verify if a session is valid
   *
   * @param sessionId - ID of the session to verify
   * @returns Promise with user ID if session is valid
   * @throws UnauthorizedException if session is invalid
   */
  async verifySession(sessionId: string): Promise<number> {
    return withErrorHandling(
      async () => {
        // Check if session exists and is not expired
        const session = await this.prisma.session.findUnique({
          where: { id: sessionId },
        });

        if (!session || session.expires < new Date()) {
          throw new UnauthorizedException('Invalid or expired session');
        }

        // Check if user exists
        const user = await this.prisma.user.findUnique({
          where: { id: session.userId },
        });

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        return session.userId;
      },
      {
        entityName: 'session',
        operation: 'verify',
      },
    );
  }

  /**
   * Invalidates various user-related caches
   * Groups all cache invalidation logic in one place for consistency
   *
   * @param userId - Optional specific user ID to invalidate
   * @private - Internal function for service use only
   */
  private async invalidateCache(userId?: number): Promise<void> {
    try {
      const cacheDeletions: Promise<void>[] = [];

      // Specific user cache if ID is provided
      if (userId) {
        cacheDeletions.push(this.cacheService.delete(cacheKeys.user(userId)));
      }

      // Always invalidate list cache
      cacheDeletions.push(this.cacheService.delete('users:*'));

      // Execute all cache deletions concurrently
      await Promise.all(cacheDeletions);
    } catch (error) {
      this.logger.error('Failed to invalidate user cache', {
        error: error.message,
      });
    }
  }
}

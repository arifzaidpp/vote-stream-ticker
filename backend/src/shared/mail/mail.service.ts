import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { PendingUser } from '../../modules/auth/models/pending-user.model';
import { User } from '../../modules/auth/models/user.model';

@Injectable()
export class MailService {
  private frontendUrl: string | undefined;
  private rateLimiter: RateLimiterMemory;
  private readonly logger = new Logger(MailService.name);
  private verificationTokenExpiry: number;
  private passwordResetTokenExpiry: number;
  private enableVerification: boolean;
  private enablePasswordReset: boolean;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('app.frontendUrl');
    
    // Get mail config values
    const mailConfig = this.configService.get('mail');
    this.verificationTokenExpiry = mailConfig.verificationTokenExpiry;
    this.passwordResetTokenExpiry = mailConfig.passwordResetTokenExpiry;
    this.enableVerification = mailConfig.enableVerification;
    this.enablePasswordReset = mailConfig.enablePasswordReset;
    
    // Initialize rate limiter
    this.rateLimiter = new RateLimiterMemory({
      points: mailConfig.rateLimitPerHour,
      duration: 60 * 60, // 1 hour in seconds
    });
  }

  /**
   * Check if user has exceeded email rate limit
   * @param userId User ID or email to check
   * @returns True if rate limit exceeded, false otherwise
   */
  private async checkRateLimit(userId: number | string): Promise<boolean> {
    try {
      await this.rateLimiter.consume(userId.toString());
      return false; // Not rate limited
    } catch (error) {
      this.logger.warn(`Rate limit exceeded for user ${userId}`);
      return true; // Rate limited
    }
  }

  /**
   * Send welcome email after user registration
   * @param user User to send email to
   */
  async sendWelcomeEmail(user: User): Promise<boolean> {
    if (await this.checkRateLimit(user.id as number)) {
      return false;
    }

    try {
      await this.mailerService.sendMail({
        to: user.email as string,
        subject: 'Welcome to Election Result!',
        template: 'welcome',
        context: {
          name: user.email,
          url: this.frontendUrl,
          currentYear: new Date().getFullYear(),
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}`, error.stack);
      return false;
    }
  }

  /**
   * Send email verification link
   * @param user User to send email to
   * @param token Verification token
   */
  async sendVerificationEmail(user: PendingUser, token: string): Promise<boolean> {
    if (!this.enableVerification) {
      this.logger.log('Email verification is disabled');
      return false;
    }

    if (await this.checkRateLimit(user.email)) {
      return false;
    }

    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify your email address',
        template: 'email-verification',
        context: {
          name: user.email,
          url: verificationUrl,
          expiryHours: Math.floor(this.verificationTokenExpiry / 3600), // Convert seconds to hours
          currentYear: new Date().getFullYear(),
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${user.email}`, error.stack);
      return false;
    }
  }

  /**
   * Send password reset link
   * @param user User to send email to
   * @param token Reset token
   */
  async sendPasswordResetEmail(user: User, token: string): Promise<boolean> {
    if (!this.enablePasswordReset) {
      this.logger.log('Password reset emails are disabled');
      return false;
    }

    if (await this.checkRateLimit(user.id as number)) {
      return false;
    }

    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email as string,
        subject: 'Reset your password',
        template: 'password-reset',
        context: {
          name: user.email,
          url: resetUrl,
          expiryMinutes: Math.floor(this.passwordResetTokenExpiry / 60), // Convert seconds to minutes
          currentYear: new Date().getFullYear(),
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${user.email}`, error.stack);
      return false;
    }
  }

  /**
   * Send a generic email
   * @param to Recipient email
   * @param subject Email subject
   * @param template Template to use
   * @param context Template context
   */
  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context: {
          ...context,
          url: this.frontendUrl,
          currentYear: new Date().getFullYear(),
        },
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      return false;
    }
  }


}

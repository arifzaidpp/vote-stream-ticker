import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';
import mailConfig from 'src/config/mail.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mailConfig], // Load mail.config.ts
      isGlobal: true, // Make it available globally
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('mail.smtp.host'),
          port: configService.get<number>('mail.smtp.port'),
          secure: configService.get<boolean>('mail.smtp.secure'),
          auth: {
            user: configService.get<string>('mail.smtp.auth.user'),
            pass: configService.get<string>('mail.smtp.auth.pass'),
          },
          debug: true, // Enable debug logs
        },
        defaults: {
          from: `${configService.get<string>('mail.fromName')} <${configService.get<string>('mail.from')}>`,
        },
        template: {
          dir: __dirname + '/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

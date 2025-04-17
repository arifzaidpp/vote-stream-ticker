import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for local (username/password) authentication
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
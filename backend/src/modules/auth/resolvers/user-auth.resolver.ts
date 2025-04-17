import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserAuthService } from '../services/user-auth.service';
import { SuccessResponse } from 'src/common/models/pagination.model';
import { CreateUserDto } from '../dto/user/create-user.input';
import { LoginDto } from '../dto/user/login.input';
import { User } from '../models/user.model';
import { LoginResponse } from '../dto/user/login.response';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { VerifyEmailResponse } from '../dto/verify-email.response';
import { VerifyEmailDto } from '../dto/verify-email.input';
import { ResetPasswordDto } from '../dto/reset-password.input';
import { ForgotPasswordDto } from '../dto/forgot-password.input';
import { ChangePasswordInput } from '../dto/change-password.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SetPasswordInput } from '../dto/set-password.input';

@Resolver()
export class UserAuthResolver {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Mutation(() => SuccessResponse)
  async register(
    @Args('input') input: CreateUserDto,
    @Context() context: { req: Request },
  ): Promise<SuccessResponse> {
    return this.userAuthService.register(input, context.req);
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('input') input: LoginDto,
    @Context() context: { req: Request; res: Response },
  ): Promise<User> {
    return this.userAuthService.login(input, context.req, context.res) as unknown as Promise<User>;
  }

//   @Mutation(() => GoogleAuthResponse)
//   async loginWithGoogle(
//     @Args('input') input: GoogleAuthDto,
//     @Context() context: { req: Request; res: Response },
//   ): Promise<GoogleAuthResponse> {
//     return this.userAuthService.loginWithGoogle(input, context.req, context.res);
//   }

// TODO : Uncomment this when the feature is ready

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard)
  async logout(
    @Context() context: { req: Request; res: Response },
  ): Promise<SuccessResponse> {
    // Get sessionId from the cookies
    return this.userAuthService.logout(context.res);
  }

  @Mutation(() => VerifyEmailResponse)
  async verifyEmail(
    @Args('input') input: VerifyEmailDto,
  ): Promise<VerifyEmailResponse> {
    return this.userAuthService.verifyEmail(input) as unknown as Promise<VerifyEmailResponse>;
  }

  @Mutation(() => SuccessResponse)
  async resendVerificationEmail(
    @Args('email') email: string,
  ): Promise<SuccessResponse> {
    return this.userAuthService.resendVerificationEmail(email);
  }

  @Mutation(() => SuccessResponse)
  async requestPasswordReset(
    @Args('input') input: ForgotPasswordDto,
  ): Promise<SuccessResponse> {
    return this.userAuthService.requestPasswordReset(input);
  }

  @Mutation(() => SuccessResponse)
  async resetPassword(
    @Args('input') input: ResetPasswordDto
  ): Promise<SuccessResponse> {
    return this.userAuthService.resetPassword(input);
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: User,
  ): Promise<SuccessResponse> {
    return this.userAuthService.changePassword(user.id as number, input);
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard)
  async setPasswordForOAuthUser(
    @Args('input') input: SetPasswordInput,
    @CurrentUser() user: User,
  ): Promise<SuccessResponse> {
    return this.userAuthService.setPasswordForOAuthUser(user.id as number, input);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.userAuthService.me(user.id as number) as unknown as Promise<User>;
  }
}
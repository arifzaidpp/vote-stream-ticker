import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { UserPaginated } from '../dto/user/user.dto';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';
import { PERMISSIONS } from 'src/common/constants/permission.constants';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { UpdateProfileInput } from '../dto/user/user-profile.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async userById(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.userService.userById(id);
  }

  @Query(() => UserPaginated)
  @RequirePermissions(PERMISSIONS.VIEW_USERS)
  async users(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<UserPaginated> {
    return this.userService.users(pagination || {});
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUserProfile(
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.userService.updateUserProfile(user.id as number, input);
  }
}
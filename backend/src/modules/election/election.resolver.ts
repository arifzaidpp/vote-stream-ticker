// ../../../election/election.resolver.ts
import { Resolver, Mutation, Args, Context, Query, Int } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { ElectionService } from './election.service';
import { ElectionResponse } from './model/election.model';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CreateElectionDto } from './dto/election/create-election.input';
import { UpdateElectionDto } from './dto/election/update-election.input';
import { PaginationWithSearchInput } from '../../common/dto/pagination.dto';
import { SortInput } from '../../common/dto/sort.dto';
import { SuccessResponse } from '../../common/models/pagination.model';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../modules/auth/models/user.model';
import { Request } from 'express';
import { ElectionPaginated } from './model/election-paginated.model';
import { ElectionFilter } from './dto/election/election-filter.input';

@Resolver(() => ElectionResponse)
export class ElectionResolver {
  constructor(private readonly electionService: ElectionService) {}

  @Query(() => ElectionPaginated)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ELECTION_CONTROLLER')
  async elections(
    @CurrentUser() user: User,

    @Args('pagination', {
      type: () => PaginationWithSearchInput,
      nullable: true,
    })
    pagination?: PaginationWithSearchInput,

    @Args('sort', { type: () => SortInput, nullable: true })
    sort?: SortInput,

    @Args('filters', { type: () => ElectionFilter, nullable: true })
    filters?: ElectionFilter,
  ): Promise<ElectionPaginated> {
    if (typeof user.id !== 'number') {
      throw new BadRequestException('Invalid user ID');
    }
    return await this.electionService.getAllElectionsByUserId(user.id, pagination, sort, filters);
  }

  @Query(() => ElectionResponse)
  @UseGuards(GqlAuthGuard)
  async electionById(
    @Args('id') id: string
  ): Promise<ElectionResponse> {
    const electionResponse = await this.electionService.getElectionById(id);
    return electionResponse as unknown as ElectionResponse;
  }

  @Query(() => ElectionResponse)
  async electionByAccessCode(
    @Args('accessCode') accessCode: string
  ): Promise<ElectionResponse> {
    const electionResponse = await this.electionService.getElectionByAccessCode(accessCode);
    return electionResponse as unknown as ElectionResponse;
  }

  @Mutation(() => SuccessResponse)
  async verifyElectionAccessCode(
    @Args('accessCode') accessCode: string
  ): Promise<SuccessResponse> {
    const electionResponse = await this.electionService.verifyElectionAccessCode(accessCode);
    return electionResponse as unknown as SuccessResponse;
  }

  @Query(() => Int)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ELECTION_CONTROLLER')
  async electionCount(
    @CurrentUser() user: User,
    @Args('filter', { type: () => ElectionFilter, nullable: true })
    filter?: ElectionFilter,
  ): Promise<number> {
    if (typeof user.id !== 'number') {
      throw new BadRequestException('Invalid user ID');
    }
    return this.electionService.countElections(user.id, filter);
  }

  @Mutation(() => ElectionResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ELECTION_CONTROLLER')
  async createElection(
    @Args('input') input: CreateElectionDto,
    @CurrentUser() user: User,
    @Context() context: { req: Request }
  ): Promise<ElectionResponse> {
    if (typeof user.id !== 'number') {
      throw new BadRequestException('Invalid user ID');
    }
    const electionResponse = await this.electionService.createElection(input, user.id);
    return electionResponse as unknown as ElectionResponse;
  }

  @Mutation(() => ElectionResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ELECTION_CONTROLLER')
  async updateElection(
    @Args('input') input: UpdateElectionDto,
    @CurrentUser() user: User,
    @Context() context: { req: Request }
  ): Promise<ElectionResponse> {
    if (typeof user.id !== 'number') {
        throw new BadRequestException('Invalid user ID');
      }
    const electionResponse = await this.electionService.updateElection(input, user.id);
    return electionResponse as unknown as ElectionResponse;
  }

  @Mutation(() => ElectionResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ELECTION_CONTROLLER')
  async deleteElection(
    @Args('id') id: string,
    @CurrentUser() user: User,
    @Context() context: { req: Request }
  ): Promise<ElectionResponse> {
    if (typeof user.id !== 'number') {
        throw new BadRequestException('Invalid user ID');
      }
    const electionResponse = await this.electionService.deleteElection(id, user.id);
    return electionResponse as unknown as ElectionResponse;
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ELECTION_CONTROLLER')
  async deleteElections(
    @Args('ids', { type: () => [String] }) ids: string[],
    @CurrentUser() user: User,
    @Context() context: { req: Request },
  ): Promise<SuccessResponse> {
    if (ids.length === 0) {
      throw new BadRequestException(
        'At least one ID is required for deleting elections',
      );
    }
    if (typeof user.id !== 'number') {
        throw new BadRequestException('Invalid user ID');
      }
    return this.electionService.deleteManyElections(ids, user.id);
  }
}
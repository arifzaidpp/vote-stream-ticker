// import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
// import { BoothService } from '../services/booth.service';
// import { CountingRoundService } from '../services/counting-round.service';
// import { ElectionService } from '../services/election.service';
// import { Booth } from '../model/booth.model';
// import { CreateBoothInput } from '../dto/booth/create-booth.input';
// import { UpdateBoothInput } from '../dto/booth/update-booth.input';
// import { Election } from '../model/election.model';
// import { CountingRound } from '../model/counting-round.model';


// @Resolver(() => Booth)
// export class BoothResolver {
//   constructor(
//     private boothService: BoothService,
//     private electionService: ElectionService,
//     private countingRoundService: CountingRoundService,
//   ) {}

//   @Query(() => [Booth])
//   async booths(): Promise<Booth[]> {
//     return this.boothService.findAll();
//   }

//   @Query(() => [Booth])
//   async boothsByElection(
//     @Args('electionId', { type: () => ID }) electionId: string,
//   ): Promise<Booth[]> {
//     return this.boothService.findByElection(electionId);
//   }

//   @Query(() => Booth, { nullable: true })
//   async booth(@Args('id', { type: () => ID }) id: string): Promise<Booth | null> {
//     return this.boothService.findOne(id);
//   }

//   @Mutation(() => Booth)
//   async createBooth(@Args('input') input: CreateBoothInput): Promise<Booth> {
//     return this.boothService.create(input);
//   }

//   @Mutation(() => Booth)
//   async updateBooth(@Args('input') input: UpdateBoothInput): Promise<Booth> {
//     return this.boothService.update(input);
//   }

//   @Mutation(() => Booth)
//   async deleteBooth(@Args('id', { type: () => ID }) id: string): Promise<Booth> {
//     return this.boothService.remove(id);
//   }

//   @ResolveField(() => Election)
//   async election(@Parent() booth: Booth): Promise<Election | null> {
//     const { electionId } = booth;
//     return this.electionService.findOne(electionId);
//   }

//   @ResolveField(() => [CountingRound])
//   async countingRounds(@Parent() booth: Booth): Promise<CountingRound[]> {
//     const { id } = booth;
//     return this.countingRoundService.findByBooth(id);
//   }
// }
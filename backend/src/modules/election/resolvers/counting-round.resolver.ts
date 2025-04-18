// import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
// import { CountingRoundService } from '../services/counting-round.service';
// import { BoothService } from '../services/booth.service';
// import { ResultService } from '../services/result.service';
// import { CountingRound } from '../model/counting-round.model';
// import { CreateCountingRoundInput } from '../dto/counting-round/create-counting-round.input';
// import { UpdateCountingRoundInput } from '../dto/counting-round/update-counting-round.input';
// import { Booth } from '../model/booth.model';
// import { Result } from '../model/result.model';
// import { PubSub } from 'graphql-subscriptions';

// const pubSub = new PubSub();

// @Resolver(() => CountingRound)
// export class CountingRoundResolver {
//   constructor(
//     private countingRoundService: CountingRoundService,
//     private boothService: BoothService,
//     private resultService: ResultService,
//   ) {}

//   @Query(() => [CountingRound])
//   async countingRounds(): Promise<CountingRound[]> {
//     return this.countingRoundService.findAll();
//   }

//   @Query(() => [CountingRound])
//   async countingRoundsByBooth(
//     @Args('boothId', { type: () => ID }) boothId: string,
//   ): Promise<CountingRound[]> {
//     return this.countingRoundService.findByBooth(boothId);
//   }

//   @Query(() => CountingRound, { nullable: true })
//   async countingRound(@Args('id', { type: () => ID }) id: string): Promise<CountingRound | null> {
//     return this.countingRoundService.findOne(id);
//   }

//   @Mutation(() => CountingRound)
//   async createCountingRound(@Args('input') input: CreateCountingRoundInput): Promise<CountingRound> {
//     const countingRound = await this.countingRoundService.create(input);
    
//     // Publish the update to subscribed clients
//     const booth = await this.boothService.findOne(input.boothId);
//     if (booth && booth.election) {
//       pubSub.publish('voteCountUpdated', { 
//         voteCountUpdated: {
//           electionId: booth.election.id,
//           boothId: booth.id,
//           roundId: countingRound.id,
//           results: countingRound.results
//         }
//       });
//     }
    
//     return countingRound;
//   }

//   @Mutation(() => CountingRound)
//   async updateCountingRound(@Args('input') input: UpdateCountingRoundInput): Promise<CountingRound> {
//     const countingRound = await this.countingRoundService.update(input);
    
//     // Publish the update if the round is published
//     if (input.isPublished) {
//       const booth = await this.boothService.findOne(countingRound.boothId);
//       if (booth && booth.election) {
//         pubSub.publish('voteCountPublished', { 
//           voteCountPublished: {
//             electionId: booth.election.id,
//             boothId: booth.id,
//             roundId: countingRound.id,
//             results: countingRound.results
//           }
//         });
//       }
//     }
    
//     return countingRound;
//   }

//   @Mutation(() => CountingRound)
//   async deleteCountingRound(@Args('id', { type: () => ID }) id: string): Promise<CountingRound> {
//     return this.countingRoundService.remove(id);
//   }

//   @ResolveField(() => Booth)
//   async booth(@Parent() countingRound: CountingRound): Promise<Booth | null> {
//     const { boothId } = countingRound;
//     return this.boothService.findOne(boothId);
//   }

//   @ResolveField(() => [Result])
//   async results(@Parent() countingRound: CountingRound): Promise<Result[]> {
//     const { id } = countingRound;
//     return this.resultService.findByRound(id);
//   }
// }
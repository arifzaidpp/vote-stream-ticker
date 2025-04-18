// import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID, Subscription } from '@nestjs/graphql';
// import { ResultService } from '../services/result.service';
// import { CountingRoundService } from '../services/counting-round.service';
// import { CandidateService } from '../services/candidate.service';

// import { PubSub } from 'graphql-subscriptions';
// import { Result } from '../model/result.model';
// import { CreateResultInput } from '../dto/result/create-result.input';
// import { UpdateResultInput } from '../dto/result/update-result.input';
// import { CountingRound } from '../model/counting-round.model';
// import { Candidate } from '../model/candidate.model';

// const pubSub = new PubSub();

// @Resolver(() => Result)
// export class ResultResolver {
//   constructor(
//     private resultService: ResultService,
//     private countingRoundService: CountingRoundService,
//     private candidateService: CandidateService,
//   ) {}

//   @Query(() => [Result])
//   async results(): Promise<Result[]> {
//     return this.resultService.findAll();
//   }

//   @Query(() => [Result])
//   async resultsByRound(
//     @Args('roundId', { type: () => ID }) roundId: string,
//   ): Promise<Result[]> {
//     return this.resultService.findByRound(roundId);
//   }

//   @Query(() => [Result])
//   async resultsByCandidate(
//     @Args('candidateId', { type: () => ID }) candidateId: string,
//   ): Promise<Result[]> {
//     return this.resultService.findByCandidate(candidateId);
//   }

//   @Query(() => Result, { nullable: true })
//   async result(@Args('id', { type: () => ID }) id: string): Promise<Result | null> {
//     return this.resultService.findOne(id);
//   }

//   @Mutation(() => Result)
//   async createResult(@Args('input') input: CreateResultInput): Promise<Result> {
//     const result = await this.resultService.create(input);
    
//     // Publish the single result update
//     const round = await this.countingRoundService.findOne(result.roundId);
//     if (round && round.booth) {
//       const booth = round.booth;
//       pubSub.publish('resultUpdated', { 
//         resultUpdated: {
//           boothId: booth.id,
//           roundId: round.id,
//           result
//         }
//       });
//     }
    
//     return result;
//   }

//   @Mutation(() => Boolean)
//   async createManyResults(
//     @Args('roundId', { type: () => ID }) roundId: string,
//     @Args('inputs', { type: () => [CreateResultInput] }) inputs: CreateResultInput[]
//   ): Promise<boolean> {
//     const count = await this.resultService.createMany(inputs, roundId);
    
//     // Publish the batch result update
//     const round = await this.countingRoundService.findOne(roundId);
//     if (round && round.booth) {
//       const booth = round.booth;
//       const results = await this.resultService.findByRound(roundId);
      
//       pubSub.publish('resultsUpdated', { 
//         resultsUpdated: {
//           boothId: booth.id,
//           roundId: roundId,
//           results
//         }
//       });
//     }
    
//     return count > 0;
//   }

//   @Mutation(() => Result)
//   async updateResult(@Args('input') input: UpdateResultInput): Promise<Result> {
//     const result = await this.resultService.update(input);
    
//     // Publish the result update
//     const round = await this.countingRoundService.findOne(result.roundId);
//     if (round && round.booth) {
//       const booth = round.booth;
//       pubSub.publish('resultUpdated', { 
//         resultUpdated: {
//           boothId: booth.id,
//           roundId: round.id,
//           result
//         }
//       });
//     }
    
//     return result;
//   }

//   @Mutation(() => Result)
//   async deleteResult(@Args('id', { type: () => ID }) id: string): Promise<Result> {
//     return this.resultService.remove(id);
//   }

//   @ResolveField(() => CountingRound)
//   async countingRound(@Parent() result: Result): Promise<CountingRound | null> {
//     const { roundId } = result;
//     return this.countingRoundService.findOne(roundId);
//   }

//   @ResolveField(() => Candidate)
//   async candidate(@Parent() result: Result): Promise<Candidate | null> {
//     const { candidateId } = result;
//     return this.candidateService.findOne(candidateId);
//   }

//   @Subscription(() => Result)
//   resultUpdated() {
//     return pubSub.asyncIterableIterator('resultUpdated');
//   }

//   @Subscription(() => [Result])
//   resultsUpdated() {
//     return pubSub.asyncIterableIterator('resultsUpdated');
//   }

//   @Subscription(() => Object)
//   voteCountUpdated() {
//     return pubSub.asyncIterableIterator('voteCountUpdated');
//   }

//   @Subscription(() => Object)
//   voteCountPublished() {
//     return pubSub.asyncIterableIterator('voteCountPublished');
//   }
// }
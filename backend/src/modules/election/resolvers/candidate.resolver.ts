// import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
// import { CandidateService } from '../services/candidate.service';
// import { PartyService } from '../services/party.service';
// import { ResultService } from '../services/result.service';
// import { Candidate } from '../model/candidate.model';
// import { CreateCandidateInput } from '../dto/candidate/create-candidate.input';
// import { UpdateCandidateInput } from '../dto/candidate/update-candidate.input';
// import { Party } from '../model/party.model';
// import { Result } from '../model/result.model';

// @Resolver(() => Candidate)
// export class CandidateResolver {
//   constructor(
//     private candidateService: CandidateService,
//     private partyService: PartyService,
//     private resultService: ResultService,
//   ) {}

//   @Query(() => [Candidate])
//   async candidates(): Promise<Candidate[]> {
//     return this.candidateService.findAll();
//   }

//   @Query(() => [Candidate])
//   async candidatesByParty(
//     @Args('partyId', { type: () => ID }) partyId: string,
//   ): Promise<Candidate[]> {
//     return this.candidateService.findByParty(partyId);
//   }

//   @Query(() => Candidate, { nullable: true })
//   async candidate(@Args('id', { type: () => ID }) id: string): Promise<Candidate | null> {
//     return this.candidateService.findOne(id);
//   }

//   @Mutation(() => Candidate)
//   async createCandidate(@Args('input') input: CreateCandidateInput): Promise<Candidate> {
//     return this.candidateService.create(input);
//   }

//   @Mutation(() => Candidate)
//   async updateCandidate(@Args('input') input: UpdateCandidateInput): Promise<Candidate> {
//     return this.candidateService.update(input);
//   }

//   @Mutation(() => Candidate)
//   async deleteCandidate(@Args('id', { type: () => ID }) id: string): Promise<Candidate> {
//     return this.candidateService.remove(id);
//   }

//   @ResolveField(() => Party)
//   async party(@Parent() candidate: Candidate): Promise<Party | null> {
//     const { partyId } = candidate;
//     return this.partyService.findOne(partyId);
//   }

//   @ResolveField(() => [Result])
//   async results(@Parent() candidate: Candidate): Promise<Result[]> {
//     const { id } = candidate;
//     return this.resultService.findByCandidate(id);
//   }
// }
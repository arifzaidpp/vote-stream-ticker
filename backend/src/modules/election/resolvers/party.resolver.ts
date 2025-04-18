// import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
// import { PartyService } from '../services/party.service';
// import { CandidateService } from '../services/candidate.service';
// import { ElectionService } from '../services/election.service';
// import { Party } from '../model/party.model';
// import { CreatePartyInput } from '../dto/party/create-party.input';
// import { UpdatePartyInput } from '../dto/party/update-party.input';
// import { Election } from '../model/election.model';
// import { Candidate } from '../model/candidate.model';


// @Resolver(() => Party)
// export class PartyResolver {
//   constructor(
//     private partyService: PartyService,
//     private electionService: ElectionService,
//     private candidateService: CandidateService,
//   ) {}

//   @Query(() => [Party])
//   async parties(): Promise<Party[]> {
//     return this.partyService.findAll();
//   }

//   @Query(() => [Party])
//   async partiesByElection(
//     @Args('electionId', { type: () => ID }) electionId: string,
//   ): Promise<Party[]> {
//     return this.partyService.findByElection(electionId);
//   }

//   @Query(() => Party, { nullable: true })
//   async party(@Args('id', { type: () => ID }) id: string): Promise<Party | null> {
//     return this.partyService.findOne(id);
//   }

//   @Mutation(() => Party)
//   async createParty(@Args('input') input: CreatePartyInput): Promise<Party> {
//     return this.partyService.create(input);
//   }

//   @Mutation(() => Party)
//   async updateParty(@Args('input') input: UpdatePartyInput): Promise<Party> {
//     return this.partyService.update(input);
//   }

//   @Mutation(() => Party)
//   async deleteParty(@Args('id', { type: () => ID }) id: string): Promise<Party> {
//     return this.partyService.remove(id);
//   }

//   @ResolveField(() => Election)
//   async election(@Parent() party: Party): Promise<Election | null> {
//     const { electionId } = party;
//     return this.electionService.findOne(electionId);
//   }

//   @ResolveField(() => [Candidate])
//   async candidates(@Parent() party: Party): Promise<Candidate[]> {
//     const { id } = party;
//     return this.candidateService.findByParty(id);
//   }
// }
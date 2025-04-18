// import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
// import { ElectionService } from '../services/election.service';
// import { BoothService } from '../services/booth.service';
// import { PartyService } from '../services/party.service';
// import { Election } from '../model/election.model';
// import { CreateElectionInput } from '../dto/election/create-election.input';
// import { UpdateElectionInput } from '../dto/election/update-election.input';
// import { Booth } from '../model/booth.model';
// import { Party } from '../model/party.model';


// @Resolver(() => Election)
// export class ElectionResolver {
//   constructor(
//     private electionService: ElectionService,
//     private boothService: BoothService,
//     private partyService: PartyService,
//   ) {}

//   @Query(() => [Election])
//   async elections(): Promise<Election[]> {
//     return this.electionService.findAll();
//   }

//   @Query(() => Election, { nullable: true })
//   async election(@Args('id', { type: () => ID }) id: string): Promise<Election | null> {
//     return this.electionService.findOne(id);
//   }

//   @Mutation(() => Election)
//   async createElection(@Args('input') input: CreateElectionInput): Promise<Election> {
//     return this.electionService.create(input);
//   }

//   @Mutation(() => Election)
//   async updateElection(@Args('input') input: UpdateElectionInput): Promise<Election> {
//     return this.electionService.update(input);
//   }

//   @Mutation(() => Election)
//   async deleteElection(@Args('id', { type: () => ID }) id: string): Promise<Election> {
//     return this.electionService.remove(id);
//   }

//   @ResolveField(() => [Booth])
//   async booths(@Parent() election: Election): Promise<Booth[]> {
//     const { id } = election;
//     return this.boothService.findByElection(id);
//   }

//   @ResolveField(() => [Party])
//   async parties(@Parent() election: Election): Promise<Party[]> {
//     const { id } = election;
//     return this.partyService.findByElection(id);
//   }
// }
// import {
//     WebSocketGateway,
//     WebSocketServer,
//     SubscribeMessage,
//     OnGatewayConnection,
//     OnGatewayDisconnect,
//     OnGatewayInit,
//   } from '@nestjs/websockets';
//   import { Server, Socket } from 'socket.io';
//   import { Logger } from '@nestjs/common';
//   import { ResultService } from '../services/result.service';
//   import { CountingRoundService } from '../services/counting-round.service';
//   import { BoothService } from '../services/booth.service';
//   import { ElectionService } from '../services/election.service';
// import { CreateCountingRoundInput } from '../dto/counting-round/create-counting-round.input';
// import { CreateResultInput } from '../dto/result/create-result.input';

//   @WebSocketGateway({
//     cors: {
//       origin: '*',
//     },
//   })
//   export class ElectionGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
//     @WebSocketServer() server: Server;
//     private logger: Logger = new Logger('ElectionGateway');
  
//     constructor(
//       private resultService: ResultService,
//       private countingRoundService: CountingRoundService,
//       private boothService: BoothService,
//       private electionService: ElectionService,
//     ) {}
  
//     afterInit() {
//       this.logger.log('Election WebSocket Gateway initialized');
//     }
  
//     handleConnection(client: Socket) {
//       this.logger.log(`Client connected: ${client.id}`);
//     }
  
//     handleDisconnect(client: Socket) {
//       this.logger.log(`Client disconnected: ${client.id}`);
//     }
  
//     // Join election room to receive updates for a specific election
//     @SubscribeMessage('join-election')
//     handleJoinElection(client: Socket, electionId: string) {
//       client.join(`election-${electionId}`);
//       this.logger.log(`Client ${client.id} joined election room: ${electionId}`);
//       return { success: true, message: `Joined election room: ${electionId}` };
//     }
  
//     // Leave election room
//     @SubscribeMessage('leave-election')
//     handleLeaveElection(client: Socket, electionId: string) {
//       client.leave(`election-${electionId}`);
//       this.logger.log(`Client ${client.id} left election room: ${electionId}`);
//       return { success: true, message: `Left election room: ${electionId}` };
//     }
  
//     // Submit a new counting round with results
//     @SubscribeMessage('submit-counting-round')
//     async handleSubmitCountingRound(client: Socket, payload: {
//       electionId: string;
//       input: CreateCountingRoundInput;
//     }) {
//       try {
//         const { electionId, input } = payload;
        
//         // Create the counting round with results
//         const countingRound = await this.countingRoundService.create(input);
        
//         // Get booth to update vote count progress
//         const booth = await this.boothService.findOne(input.boothId);
//         if (booth) {
//           // Update total votes counted for the booth
//           const totalVotesCounted = (input.results ?? []).reduce((sum, result) => sum + result.voteCount, 0);
//         //   const totalVotesCounted = (input.results ?? []).reduce((sum, result) => sum + result.voteCount, 0);
//           await this.boothService.update({
//             id: booth.id,
//             totalVotesCounted: (booth.totalVotesCounted || 0) + totalVotesCounted
//           });
          
//           // Calculate election completion percentage
//           const election = await this.electionService.findOne(electionId);
//           if (election) {
//             const booths = await this.boothService.findByElection(electionId);
//             const totalVoterCount = booths.reduce((sum, b) => sum + b.voterCount, 0);
//             const totalVotesCounted = booths.reduce((sum, b) => sum + (b.totalVotesCounted || 0), 0);
//             const votingCompletion = totalVoterCount > 0 ? (totalVotesCounted / totalVoterCount) * 100 : 0;
            
//             await this.electionService.update({
//               id: electionId,
//               votingCompletion: Math.min(100, votingCompletion)
//             });
//           }
//         }
        
//         // Emit the update to all clients watching this election
//         this.server.to(`election-${electionId}`).emit('vote-count-updated', {
//           electionId,
//           boothId: input.boothId,
//           roundNumber: input.roundNumber,
//           countingRound,
//           timestamp: new Date()
//         });
        
//         return { success: true, data: countingRound };
//       } catch (error) {
//         this.logger.error(`Error submitting counting round: ${error.message}`);
//         return { success: false, error: error.message };
//       }
//     }
  
//     // Submit multiple result updates 
//     @SubscribeMessage('submit-results')
//     async handleSubmitResults(client: Socket, payload: {
//       electionId: string;
//       roundId: string;
//       results: CreateResultInput[];
//     }) {
//       try {
//         const { electionId, roundId, results } = payload;
        
//         // Create all results
//         await this.resultService.createMany(results, roundId);
        
//         // Get the full results after update
//         const updatedResults = await this.resultService.findByRound(roundId);
//         const countingRound = await this.countingRoundService.findOne(roundId);
        
//         // Update the booth's total votes counted
//         if (countingRound && countingRound.booth) {
//           const booth = countingRound.booth;
//           const totalNewVotes = results.reduce((sum, result) => sum + result.voteCount, 0);
          
//           await this.boothService.update({
//             id: booth.id,
//             totalVotesCounted: (booth.totalVotesCounted || 0) + totalNewVotes
//           });
          
//           // Calculate election completion percentage
//           const election = await this.electionService.findOne(electionId);
//           if (election) {
//             const booths = await this.boothService.findByElection(electionId);
//             const totalVoterCount = booths.reduce((sum, b) => sum + b.voterCount, 0);
//             const totalVotesCounted = booths.reduce((sum, b) => sum + (b.totalVotesCounted || 0), 0);
//             const votingCompletion = totalVoterCount > 0 ? (totalVotesCounted / totalVoterCount) * 100 : 0;
            
//             await this.electionService.update({
//               id: electionId,
//               votingCompletion: Math.min(100, votingCompletion)
//             });
//           }
//         }
        
//         // Emit the update to all clients watching this election
//         this.server.to(`election-${electionId}`).emit('results-updated', {
//           electionId,
//           roundId,
//           boothId: countingRound?.boothId,
//           results: updatedResults,
//           timestamp: new Date()
//         });
        
//         return { success: true, data: updatedResults };
//       } catch (error) {
//         this.logger.error(`Error submitting results: ${error.message}`);
//         return { success: false, error: error.message };
//       }
//     }
  
//     // Publish a counting round (make it visible to all)
//     @SubscribeMessage('publish-counting-round')
//     async handlePublishCountingRound(client: Socket, payload: {
//       electionId: string;
//       roundId: string;
//     }) {
//       try {
//         const { electionId, roundId } = payload;
        
//         // Mark the counting round as published
//         const countingRound = await this.countingRoundService.update({
//           id: roundId,
//           isPublished: true
//         });
        
//         // Emit the publish event to all clients watching this election
//         this.server.to(`election-${electionId}`).emit('counting-round-published', {
//           electionId,
//           roundId,
//           boothId: countingRound.boothId,
//           timestamp: new Date()
//         });
        
//         return { success: true, data: countingRound };
//       } catch (error) {
//         this.logger.error(`Error publishing counting round: ${error.message}`);
//         return { success: false, error: error.message };
//       }
//     }
//   }
  
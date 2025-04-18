// src/counting/gateways/counting.gateway.ts
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { UseGuards } from '@nestjs/common';
  import { CountingService } from '../counting.service';
  import { WsJwtAuthGuard } from '../../../common/guards/ws-jwt-auth.guard';
  import { SubmitVoteCountDto } from '../dto/submit-vote-count.dto';
  
  @WebSocketGateway({ 
    cors: {
      origin: '*', // In production, specify your frontend domain
    },
  })
  export class CountingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly countingService: CountingService) {}
  
    async handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    async handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage('joinElectionRoom')
    async handleJoinElection(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { electionId: string }
    ) {
      // Join a specific election room
      client.join(`election_${data.electionId}`);
      console.log('data', data);
      
      console.log(`Client ${client.id} joined election room: ${data.electionId}`);
      
      // Send current counting data
      const countingData = await this.countingService.getElectionResults(data.electionId);
      console.log('countingData', countingData);
      
      client.emit('electionData', countingData);
    }
  
    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage('submitVoteCount')
    async handleSubmitVoteCount(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: SubmitVoteCountDto
    ) {
      try {
        // Process and save the vote count
        const result = await this.countingService.submitVoteCount(data);
        
        console.log('result', result);
        
        // Broadcast the updated results to all clients in the election room
        if (result) {
          console.log('result', result);
          console.log('data.electionId', data.electionId);
          this.server.to(`election_${data.electionId}`).emit('voteCountUpdated', {
            updatedAt: new Date(),
            boothId: data.boothId,
            roundId: result.id,
            results: result.results
          });
        } else {
          console.error('Result is null or undefined.');
          client.emit('countingError', { message: 'Result is null or undefined.' });
        }
        
        return { success: true, result };
      } catch (error) {
        client.emit('countingError', { message: error.message });
        return { success: false, error: error.message };
      }
    }
  
    @UseGuards(WsJwtAuthGuard)
    @SubscribeMessage('publishCountingRound')
    async handlePublishCountingRound(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { roundId: string, electionId: string }
    ) {
      try {
        // Publish the counting round
        const updatedRound = await this.countingService.publishCountingRound(data.roundId);
        
        // Broadcast the published round to all clients in the election room
        this.server.to(`election_${data.electionId}`).emit('roundPublished', {
          updatedAt: new Date(),
          roundId: updatedRound.id,
          isPublished: updatedRound.isPublished,
          results: updatedRound.results
        });
        
        return { success: true, round: updatedRound };
      } catch (error) {
        client.emit('countingError', { message: error.message });
        return { success: false, error: error.message };
      }
    }
  }
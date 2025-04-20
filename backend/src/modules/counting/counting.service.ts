// src/counting/counting.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { SubmitVoteCountDto } from './dto/submit-vote-count.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { log } from 'console';

@Injectable()
export class CountingService {
  constructor(private readonly prisma: PrismaService) {}

  async getElectionResults(electionId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      include: {
      booths: {
        orderBy: { id: 'desc' }, // Ensure booths are in descending order
        include: {
        countingRounds: {
          // where: { status: 'PUBLISHED' },
          include: {
          results: {
            include: {
            candidate: true
            }
          }
          }
        }
        }
      },
      parties: {
        include: {
        candidates: true
        }
      }
      }
    });

    if (!election) {
      throw new NotFoundException(`Election with ID ${electionId} not found`);
    }

    return election;
  }

  async submitVoteCount(dto: SubmitVoteCountDto) {
    // Validate booth belongs to the election

    console.log('SubmitVoteCountDto', dto);
    
    const booth = await this.prisma.booth.findFirst({
      where: {
        id: dto.boothId,
        electionId: dto.electionId
      }
    });

    if (!booth) {
      throw new NotFoundException(`Booth with ID ${dto.boothId} not found in election ${dto.electionId}`);
    }

    console.log('Booth', booth);
    console.log('dto', dto);
    

    if (!dto.results) {
      console.log('Election ID is missing in the request');
      
      throw new BadRequestException('Election ID is missing in the request');
    }
    console.log('Election ID:', dto.results);

    // Log candidate IDs from the results
    const candidateIds = dto.results.map(r => r.candidateId);
    console.log('Candidate IDs:', candidateIds);
    // Validate all candidates exist and belong to this election
    // const candidateIds = dto.results.map(r => r.candidateId);
    
    console.log('Candidate IDs', candidateIds);

    const candidates = await this.prisma.candidate.findMany({
      where: {
        id: { in: candidateIds },
        party: {
          electionId: dto.electionId
        }
      }
    });

    console.log('Candidates found', candidates);
    

    if (candidates.length !== candidateIds.length) {
      console.log('Candidate IDs length mismatch', candidateIds.length, candidates.length);
      
      throw new BadRequestException('One or more candidates do not exist or do not belong to this election');
    }

    console.log('Candidates', candidates);
    

    // Create transaction to ensure data consistency
    return this.prisma.$transaction(async (prisma) => {
      // Create or update counting round
      let countingRound = await prisma.countingRound.findFirst({
        where: {
          boothId: dto.boothId,
          roundNumber: dto.roundNumber
        },
        include: { results: true }
      });

      if (countingRound) {
        // Only allow updates if the round is not published
        if (countingRound.status === 'PUBLISHED') {
          throw new BadRequestException('Cannot update a published counting round');
        }
      
        console.log('Existing counting round found:', countingRound);
        
        // Update the counting round with the new voteValue
        countingRound = await prisma.countingRound.update({
          where: { id: countingRound.id },
          data: {
            voteValue: dto.voteValue
          },
          include: { results: true }
        });
      
        // Delete existing results
        await prisma.result.deleteMany({
          where: { roundId: countingRound.id }
        });
      } else {
        // Create new counting round
        countingRound = await prisma.countingRound.create({
          data: {
            roundNumber: dto.roundNumber,
            boothId: dto.boothId,
            voteValue: dto.voteValue,
          },
          include: {
            results: true
          }
        });
      }

      // Create new results
      const resultPromises = dto.results.map(result => 
        prisma.result.create({
          data: {
            roundId: countingRound.id,
            candidateId: result.candidateId,
            voteCount: result.voteCount
          }
        })
      );

      const createdResults = await Promise.all(resultPromises);

      // Calculate total votes in this round
      const totalVotes = dto.results.reduce((sum, result) => sum + result.voteCount, 0);

      // Update the booth's total votes counted
      await prisma.booth.update({
        where: { id: dto.boothId },
        data: { totalVotesCounted: totalVotes }
      });

      // Update election voting completion percentage
      const allBooths = await prisma.booth.findMany({
        where: { electionId: dto.electionId }
      });
      
      const totalVoterCount = allBooths.reduce((sum, b) => sum + b.voterCount, 0);
      const totalVotesCounted = allBooths.reduce((sum, b) => sum + b.totalVotesCounted, 0);
      
      const votingCompletion = totalVoterCount > 0 
        ? (totalVotesCounted / totalVoterCount) * 100 
        : 0;

      await prisma.election.update({
        where: { id: dto.electionId },
        data: { votingCompletion }
      });

      console.log('Updated voting completion:', votingCompletion);
      console.log('Updated booth total votes counted:', totalVotes);
      console.log('Created results:', createdResults);
      console.log('Counting round:', countingRound);
      console.log('Booth:', booth);
      console.log('Candidates:', candidates);
      console.log('Vote count DTO:', dto);
      console.log('Vote count DTO results:', dto.results);
      

      // Return the updated counting round with results
      return prisma.countingRound.findUnique({
        where: { id: countingRound.id },
        include: {
          results: {
            include: {
              candidate: true
            }
          }
        }
      });
    });
  }

  async publishCountingRound(roundId: string) {
    const countingRound = await this.prisma.countingRound.findUnique({
      where: { id: roundId }
    });

    if (!countingRound) {
      throw new NotFoundException(`Counting round with ID ${roundId} not found`);
    }

    // Set the round as published
    return this.prisma.countingRound.update({
      where: { id: roundId },
      data: { status: 'PUBLISHED' },
      include: {
        results: {
          include: {
            candidate: true
          }
        }
      }
    });
  }

  async startBoothCounting(boothId: string) {
    const booth = await this.prisma.booth.findUnique({
      where: { id: boothId }
    });

    if (!booth) {
      throw new NotFoundException(`Booth with ID ${boothId} not found`);
    }

    // Set the booth as counting
    return this.prisma.booth.update({
      where: { id: boothId },
      data: { status: 'COUNTING' }
    });
  }

  async completeBoothCounting(boothId: string) {
    const booth = await this.prisma.booth.findUnique({
      where: { id: boothId }
    });

    if (!booth) {
      throw new NotFoundException(`Booth with ID ${boothId} not found`);
    }

    // Set the booth as completed
    return this.prisma.booth.update({
      where: { id: boothId },
      data: { status: 'COMPLETED' }
    });
  }
}
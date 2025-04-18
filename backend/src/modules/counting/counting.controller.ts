import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { CountingService } from './counting.service';
import { SubmitVoteCountDto } from './dto/submit-vote-count.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('counting')
export class CountingController {
  constructor(private readonly countingService: CountingService) {}

  @UseGuards(JwtAuthGuard)
  @Get('election/:electionId')
  async getElectionResults(@Param('electionId') electionId: string) {
    return this.countingService.getElectionResults(electionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitVoteCount(@Body() dto: SubmitVoteCountDto) {
    return this.countingService.submitVoteCount(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('publish/:roundId')
  async publishCountingRound(@Param('roundId') roundId: string) {
    return this.countingService.publishCountingRound(roundId);
  }
}
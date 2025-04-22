// ../../../election/election.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ElectionService } from './election.service';
import { ElectionResponseDto } from './dto/election-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateElectionDto } from './dto/election/create-election.input';

@Controller('elections')
export class ElectionController {
  constructor(private readonly electionService: ElectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Remove GqlAuthGuard
  @Roles('ADMIN', 'ELECTION_CONTROLLER')
  async create(
    @Body() dto: CreateElectionDto,
    @Req() req: any
  ): Promise<ElectionResponseDto> {
    // const userId = req.user.userId; // Note: matches the property name from JwtStrategy
    return this.electionService.createElection(dto, 1);
  }
}
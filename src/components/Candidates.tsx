
import React from 'react';
import { useElectionData } from '@/hooks/useElectionData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { booth1Data, booth2Data } from '@/hooks/useElectionData';

const Candidates = () => {
  const { totalData } = useElectionData();

  // Flatten candidates data with party information
  const allCandidates = booth1Data.flatMap(party => 
    party.candidates.map(candidate => ({
      ...candidate,
      partyName: party.partyName,
      partyColor: party.color,
      booth1Votes: candidate.votes,
      booth2Votes: booth2Data.find(p => p.partyName === party.partyName)
        ?.candidates.find(c => c.name === candidate.name)?.votes || 0,
      totalVotes: totalData.find(p => p.partyName === party.partyName)
        ?.candidates.find(c => c.name === candidate.name)?.votes || 0
    }))
  );

  // Sort candidates by total votes to determine leaders
  const sortedByPosition = allCandidates.reduce((acc, candidate) => {
    if (!acc[candidate.position]) {
      acc[candidate.position] = [];
    }
    acc[candidate.position].push(candidate);
    return acc;
  }, {} as Record<string, typeof allCandidates>);

  // Find leaders for each position
  const leaders = Object.entries(sortedByPosition).reduce((acc, [position, candidates]) => {
    acc[position] = Math.max(...candidates.map(c => c.totalVotes));
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 h-full">
      <h2 className="text-lg font-bold mb-4 text-center">Candidates</h2>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {allCandidates.map((candidate, index) => (
            <CarouselItem key={index} className="md:basis-full lg:basis-full">
              <div className="flex gap-4 p-2">
                <div className="flex flex-col items-center space-y-2 w-1/3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                    <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-semibold">{candidate.name}</p>
                    <p className="text-sm text-gray-500">{candidate.partyName}</p>
                    <p className="text-xs text-gray-500">{candidate.position}</p>
                  </div>
                </div>

                <div className="w-2/3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booth</TableHead>
                        <TableHead className="text-right">Votes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Booth 1</TableCell>
                        <TableCell className="text-right">{candidate.booth1Votes}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Booth 2</TableCell>
                        <TableCell className="text-right">{candidate.booth2Votes}</TableCell>
                      </TableRow>
                      <TableRow className={cn(
                        "font-medium",
                        leaders[candidate.position] === candidate.totalVotes && "bg-green-50"
                      )}>
                        <TableCell className="flex items-center gap-2">
                          Total
                          {leaders[candidate.position] === candidate.totalVotes && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Leading
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{candidate.totalVotes}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default Candidates;

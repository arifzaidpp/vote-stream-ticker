
import React, { useEffect, useState } from 'react';
import { booth1Data, booth2Data } from '@/hooks/useElectionData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';

const Candidates = () => {
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);
  
  // Flatten candidates data with party information
  const allCandidates = booth1Data.flatMap(party =>
    party.candidates.map(candidate => ({
      ...candidate,
      partyName: party.partyName,
      partyColor: party.color,
      booth1Votes: candidate.votes,
      booth2Votes: booth2Data.find(p => p.partyName === party.partyName)
        ?.candidates.find(c => c.name === candidate.name)?.votes || 0,
      totalVotes: booth1Data.find(p => p.partyName === party.partyName)
        ?.candidates.find(c => c.name === candidate.name)?.votes || 0 +
        booth2Data.find(p => p.partyName === party.partyName)
        ?.candidates.find(c => c.name === candidate.name)?.votes || 0
    }))
  );

  // Sort candidates by position
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

  // Set up auto play for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoPlayIndex((current) => (current + 1) % allCandidates.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allCandidates.length]);

  return (
    <div className="bg-white rounded-lg shadow-lg py-1 px-2 h-full overflow-hidden">
      <h2 className="text-lg font-bold mb-1 text-center">Candidate Details</h2>
      
      <Carousel 
        className="h-[calc(100%-2rem)]"
        opts={{ loop: true, startIndex: autoPlayIndex }}
      >
        <CarouselContent className="h-full">
          {allCandidates.map((candidate, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="flex flex-row items-center gap-2 h-full pb-1">
                <div className="flex-shrink-0 w-1/3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
                    alt={candidate.name}
                    className="w-full h-auto rounded-md border-2 border-gray-200"
                  />
                </div>
                <div className="flex flex-col flex-grow h-full overflow-hidden">
                  <div className="mb-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-base">{candidate.name}</p>
                      <p className="text-xs text-gray-500">{candidate.partyName}</p>
                    </div>
                    <div className="flex items-center mt-0.5">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          candidate.partyColor === 'blue' ? 'bg-blue-100 text-blue-800' : 
                          candidate.partyColor === 'green' ? 'bg-green-100 text-green-800' : 
                          'bg-orange-100 text-orange-800'
                        )}
                      >
                        {candidate.position}
                      </Badge>
                    </div>
                  </div>
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm py-1 px-1">Booth</TableHead>
                        <TableHead className="text-sm py-1 px-1 text-right">Votes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-base py-1 px-2">Booth 1</TableCell>
                        <TableCell className="text-base py-1 px-2 text-right">{candidate.booth1Votes}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-base py-1 px-2">Booth 2</TableCell>
                        <TableCell className="text-base py-1 px-2 text-right">{candidate.booth2Votes}</TableCell>
                      </TableRow>
                      <TableRow className={cn(
                        "font-medium",
                        leaders[candidate.position] === candidate.totalVotes && "bg-green-50"
                      )}>
                        <TableCell className="flex items-center gap-2 text-base py-1 px-2">
                          Total
                          {leaders[candidate.position] === candidate.totalVotes && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-2">
                              Leading
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-lg py-1 px-2 text-right font-bold">
                          {candidate.booth1Votes + candidate.booth2Votes}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
          {allCandidates.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                index === autoPlayIndex ? "bg-blue-600 w-3" : "bg-gray-300"
              )}
              onClick={() => setAutoPlayIndex(index)}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default Candidates;

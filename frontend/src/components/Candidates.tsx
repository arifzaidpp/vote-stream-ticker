import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

const Candidates = ({ presidents, secretaries, treasurers }) => {
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);
  
  // Combine all candidates from different positions
  const allCandidates = [
    ...presidents.map(c => ({ ...c, position: 'PRESIDENT' })),
    ...secretaries.map(c => ({ ...c, position: 'SECRETARY' })),
    ...treasurers.map(c => ({ ...c, position: 'TREASURER' }))
  ];

  // Find leaders for each position
  const leaders = {
    PRESIDENT: presidents.length > 0 ? Math.max(...presidents.map(c => c.totalVotes || c.votes || 0), 0) : 0,
    SECRETARY: secretaries.length > 0 ? Math.max(...secretaries.map(c => c.totalVotes || c.votes || 0), 0) : 0,
    TREASURER: treasurers.length > 0 ? Math.max(...treasurers.map(c => c.totalVotes || c.votes || 0), 0) : 0
  };

  // Set up auto play for carousel
  useEffect(() => {
    if (allCandidates.length === 0) return;
    
    const interval = setInterval(() => {
      setAutoPlayIndex((current) => (current + 1) % allCandidates.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [allCandidates.length]);

  if (allCandidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg py-4 px-4 h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No candidate data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg py-1 px-2 h-full overflow-hidden">
      <h2 className="text-lg font-bold mb-1 text-center">Candidate Details</h2>
      
      <Carousel 
        className="h-[calc(100%-2rem)]"
        opts={{ loop: true, startIndex: autoPlayIndex }}
      >
        <CarouselContent className="h-full">
          {allCandidates.map((candidate, index) => {
            // Calculate total votes (either from pre-calculated value or sum booth votes)
            const totalVotes = candidate.totalVotes || candidate.votes || 0;
            const booth1Votes = candidate.booth1Votes || 0;
            const booth2Votes = candidate.booth2Votes || 0;
            
            return (
              <CarouselItem key={index} className="h-full">
                <div className="flex flex-row items-center gap-2 h-full pb-1">
                  <div className="flex-shrink-0 w-1/3">
                    {candidate.photo ? (
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        // className="w-full h-auto rounded-md border-2 border-gray-200 object-cover"
                      />
                    ) : (
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
                        alt={candidate.name}
                        className="w-full h-auto rounded-md border-2 border-gray-200"
                      />
                    )}
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
                            candidate.partyColor === 'red' ? 'bg-red-100 text-red-800' :
                            candidate.partyColor === 'purple' ? 'bg-purple-100 text-purple-800' :
                            candidate.partyColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          )}
                        >
                          {candidate.position}
                        </Badge>
                        
                        {leaders[candidate.position] === totalVotes && 
                         totalVotes > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs ml-2">
                            Leading
                          </Badge>
                        )}
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
                          <TableCell className="text-base py-1 px-2 text-right">{booth1Votes}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-base py-1 px-2">Booth 2</TableCell>
                          <TableCell className="text-base py-1 px-2 text-right">{booth2Votes}</TableCell>
                        </TableRow>
                        <TableRow className={cn(
                          "font-medium",
                          leaders[candidate.position] === totalVotes && "bg-green-50"
                        )}>
                          <TableCell className="flex items-center gap-2 text-base py-1 px-2">
                            Total
                            {leaders[candidate.position] === totalVotes && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-2">
                                Leading
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-lg py-1 px-2 text-right font-bold">
                            {totalVotes}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
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
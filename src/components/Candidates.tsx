import React from 'react';
import { useElectionData } from '@/hooks/useElectionData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

  // Display the first candidate
  const candidate = allCandidates[0];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-row items-center gap-4">
      <div className="flex-shrink-0 w-1/3">
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
          alt={candidate.name}
          className="w-full h-auto"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <div className="mb-4">
            <div className="flex justify-between items-center">
            <p className="font-semibold text-lg">{candidate.name}</p>
            <p className="text-sm text-gray-500">{candidate.partyName}</p>
            </div>
        </div>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs p-1">Booth</TableHead>
              <TableHead className="text-xs p-1 text-right">Votes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-xs py-0.5 px-1">Booth 1</TableCell>
              <TableCell className="text-xs py-0.5 px-1 text-right">{candidate.booth1Votes}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-xs py-0.5 px-1">Booth 2</TableCell>
              <TableCell className="text-xs py-0.5 px-1 text-right">{candidate.booth2Votes}</TableCell>
            </TableRow>
            <TableRow className={cn(
              "font-medium",
              leaders[candidate.position] === candidate.totalVotes && "bg-green-50"
            )}>
              <TableCell className="flex items-center gap-1 text-xs py-0.5 px-1">
                Total
                {leaders[candidate.position] === candidate.totalVotes && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-1 py-0 h-4">
                    Leading
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-xs py-0.5 px-1 text-right">{candidate.totalVotes}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

  );
};

export default Candidates;
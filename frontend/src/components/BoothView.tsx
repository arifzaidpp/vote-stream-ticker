import React, { useState, useEffect } from 'react';
import PartyCard from './PartyCard';
import LeadingParties from './LeadingParties';
import VotingStats from './VotingStats';
import Candidates from './Candidates';
import LeadingCandidates from './LeadingCandidates';

interface BoothViewProps {
  boothName: string;
  boothNumber?: string | null;
  partyData: any[];
  leadingCandidates: {
    president: any;
    secretary: any;
    treasurer: any;
  };
  totalVotes: number;
  pendingVotes: number;
  countingPercentage: number;
  onSwitch: () => void;
  autoSwitchInterval?: number;
  candidateComparison: {
    presidents: any[];
    secretaries: any[];
    treasurers: any[];
  };
}

const BoothView: React.FC<BoothViewProps> = ({
  boothName,
  boothNumber,
  partyData,
  leadingCandidates,
  totalVotes,
  pendingVotes,
  countingPercentage,
  candidateComparison,
  onSwitch,
  autoSwitchInterval = 10000 // Default 10 seconds
}) => {

  console.log("BoothView partyData:", partyData);
  
  useEffect(() => {
    if (!autoSwitchInterval) return;

    const interval = setInterval(() => {
      onSwitch();
    }, autoSwitchInterval);

    return () => clearInterval(interval);
  }, [onSwitch, autoSwitchInterval]);

  // Process party data for the LeadingParties component
  const processedPartyData = partyData.map(party => {
    // Calculate total votes for this party across all candidates
    const partyVotes = party.candidates.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);
    
    return {
      id: party.partyId,
      name: party.partyName,
      color: party.color,
      logo: party.logo,
      votes: partyVotes
    };
  });

  // Process candidate data to ensure booth-specific votes are included
  const processedCandidateComparison = {
    presidents: candidateComparison.presidents.map(president => ({
      ...president,
      totalVotes: president.votes,
      booth1Votes: president.booth1Votes || Math.round(president.votes * 0.4), // Fallback if booth data is not provided
      booth2Votes: president.booth2Votes || Math.round(president.votes * 0.6)  // Fallback if booth data is not provided
    })),
    secretaries: candidateComparison.secretaries.map(secretary => ({
      ...secretary,
      totalVotes: secretary.votes,
      booth1Votes: secretary.booth1Votes || Math.round(secretary.votes * 0.4),
      booth2Votes: secretary.booth2Votes || Math.round(secretary.votes * 0.6)
    })),
    treasurers: candidateComparison.treasurers.map(treasurer => ({
      ...treasurer,
      totalVotes: treasurer.votes,
      booth1Votes: treasurer.booth1Votes || Math.round(treasurer.votes * 0.4),
      booth2Votes: treasurer.booth2Votes || Math.round(treasurer.votes * 0.6)
    }))
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-gray-800 text-white py-2 px-4 mb-2 flex justify-between items-center rounded-md">
        <h2 className="text-base font-bold">{boothName} Results</h2>
        <div className="py-0.5 flex-1 mx-2 overflow-hidden">
          <div className="container mx-auto overflow-hidden">
            <p className="animate-ticker whitespace-nowrap text-xs">
                ⚡ LIVE UPDATES - Counting Underway - {countingPercentage}% of Votes Counted - Stay Tuned for Final Results
                </p>
          </div>
        </div>
        <div className="flex items-center bg-blue-600 px-2 py-0.5 rounded text-xs">
          <span className="animate-pulse mr-1 h-1.5 w-1.5 bg-red-500 rounded-full inline-block"></span>
          LIVE
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 flex-1 overflow-hidden">
        {/* Party cards - left column (3/5 width) */}
        <div className="col-span-3 flex flex-col h-full gap-3">
          <div className="flex-grow grid grid-cols-3 gap-3 h-[50%]">
            {partyData.map((party, index) => (
              <PartyCard 
                key={party.partyId || index}
                partyName={party.partyName}
                color={party.color}
                candidates={party.candidates}
                boothName={boothNumber ? `Booth ${boothNumber}` : undefined}
                logo={party.logo}
              />
            ))}
          </div>
          
          <div className="h-[50%]">
            <LeadingCandidates
              president={leadingCandidates.president}
              secretary={leadingCandidates.secretary}
              treasurer={leadingCandidates.treasurer}
            />
          </div>
        </div>

        {/* Right column (2/5 width) */}
        <div className="col-span-2 flex flex-col gap-3 h-full">
          <div className="h-[32%]">
            <LeadingParties partyData={processedPartyData} />
          </div>
          
          <div className="h-[30%]">
            <Candidates
              presidents={processedCandidateComparison.presidents}
              secretaries={processedCandidateComparison.secretaries}
              treasurers={processedCandidateComparison.treasurers}
            />
          </div>
          
          <div className="h-[30%]">
            <VotingStats 
              totalVotes={totalVotes} 
              pendingVotes={pendingVotes}
              countingPercentage={countingPercentage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoothView;
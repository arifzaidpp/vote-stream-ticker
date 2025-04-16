
import React, { useState, useEffect } from 'react';
import PartyCard from './PartyCard';
import LeadingCandidates from './LeadingParties';
import VotingStats from './VotingStats';
import Candidates from './Candidates';
import CandidateComparison from './LeadingCandidates';
import LeadingCandidates1 from './LeadingCandidates';

interface BoothViewProps {
  boothName: string;
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
  partyData,
  leadingCandidates,
  totalVotes,
  pendingVotes,
  countingPercentage,
  candidateComparison,
  onSwitch,
  autoSwitchInterval = 10000 // Default 10 seconds
}) => {
  useEffect(() => {
    if (!autoSwitchInterval) return;

    const interval = setInterval(() => {
      onSwitch();
    }, autoSwitchInterval);

    return () => clearInterval(interval);
  }, [onSwitch, autoSwitchInterval]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-gray-800 text-white py-2 px-4 mb-2 flex justify-between items-center rounded-md">
        <h2 className="text-base font-bold">{boothName} Results</h2>
        <div className="py-0.5 flex-1 mx-2 overflow-hidden">
          <div className="container mx-auto overflow-hidden">
            <p className="animate-ticker whitespace-nowrap text-xs">
              ⚡ LIVE UPDATES - Counting Underway - Third Round of Counting in Progress - 65% of Votes Counted - Stay Tuned for Final Results
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
          <div className="flex-grow grid grid-cols-3 gap-3 h-[55%]">
            {partyData.map((party, index) => (
              <PartyCard
                key={index}
                partyName={party.partyName}
                color={party.color}
                candidates={party.candidates}
                boothName={boothName}
                logo={party.logo}
              />
            ))}
          </div>
          
          <div className="h-[45%]">
            <LeadingCandidates1
              president={leadingCandidates.president}
              secretary={leadingCandidates.secretary}
              treasurer={leadingCandidates.treasurer}
            />
          </div>
        </div>

        {/* Right column (2/5 width) */}
        <div className="col-span-2 flex flex-col gap-3 h-full">
          <div className="h-[32%]">
            <LeadingCandidates
              president={leadingCandidates.president}
              secretary={leadingCandidates.secretary}
              treasurer={leadingCandidates.treasurer}
            />
          </div>
          
          <div className="h-[34%]">
            <Candidates />
          </div>
          
          <div className="h-[32%]">
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

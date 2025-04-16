import React, { useState, useEffect } from 'react';
import PartyCard from './PartyCard';
import LeadingCandidates from './LeadingCandidates';
import VotingStats from './VotingStats';
import Candidates from './Candidates';
import CandidateComparison from './CandidateComparison';

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
    <div className="h-full w-full">
      <div className="bg-gray-800 text-white py-1 px-4 mb-3 flex justify-between items-center">
        <h2 className="text-lg font-bold">{boothName} Results</h2>
        <div className=" py-1">
        <div className="container mx-auto overflow-hidden">
          <p className="animate-ticker whitespace-nowrap text-sm">
            ⚡ LIVE UPDATES - Counting Underway - Third Round of Counting in Progress - 65% of Votes Counted - Stay Tuned for Final Results
          </p>
        </div>
      </div>
        <div className="flex items-center bg-blue-600 px-2 py-1 rounded text-xs">
          <span className="animate-pulse mr-1 h-2 w-2 bg-red-500 rounded-full inline-block"></span>
          LIVE
        </div>
      </div>

      <div className="grid grid-rows-8 gap-3 h-full">
        {/* Party cards moved to left side (3 columns) */}
        <div className="row-span-5">
          <div className="grid grid-cols-3 gap-3 h-full">
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
        </div>

        {/* Leading candidates and voting stats moved to right side (2 columns) */}
        {/* <div className="col-span-2">
          <div className="grid grid-rows-2 gap-3 h-full">
            <LeadingCandidates
              president={leadingCandidates.president}
              secretary={leadingCandidates.secretary}
              treasurer={leadingCandidates.treasurer}
            />

            <div className="grid grid-rows-2 gap-3 h-full">
              <Candidates
              />

              <VotingStats
                totalVotes={totalVotes}
                pendingVotes={pendingVotes}
                countingPercentage={countingPercentage}
              />
            </div>
          </div>
        </div> */}

        <div className="row-span-3">
                    <CandidateComparison
                      presidents={candidateComparison.presidents}
                      secretaries={candidateComparison.secretaries}
                      treasurers={candidateComparison.treasurers}
                    />
                  </div>
      </div>
    </div>
  );
};

export default BoothView;
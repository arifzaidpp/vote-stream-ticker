
import React, { useState, useEffect } from 'react';
import PartyCard from './PartyCard';
import LeadingCandidates from './LeadingCandidates';
import VotingStats from './VotingStats';

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
}

const BoothView: React.FC<BoothViewProps> = ({
  boothName,
  partyData,
  leadingCandidates,
  totalVotes,
  pendingVotes,
  countingPercentage,
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
        <div className="flex items-center bg-blue-600 px-2 py-1 rounded text-xs">
          <span className="animate-pulse mr-1 h-2 w-2 bg-red-500 rounded-full inline-block"></span>
          LIVE
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-3 h-[calc(100%-3rem)]">
        <div className="col-span-2">
          <div className="grid grid-rows-2 gap-3 h-full">
            <LeadingCandidates 
              president={leadingCandidates.president}
              secretary={leadingCandidates.secretary}
              treasurer={leadingCandidates.treasurer}
            />
            
            <VotingStats
              totalVotes={totalVotes}
              pendingVotes={pendingVotes}
              countingPercentage={countingPercentage}
            />
          </div>
        </div>
        
        <div className="col-span-3">
          <div className="grid grid-cols-3 gap-3 h-full">
            {partyData.map((party, index) => (
              <PartyCard
                key={index}
                partyName={party.partyName}
                color={party.color}
                candidates={party.candidates}
                boothName={boothName}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoothView;

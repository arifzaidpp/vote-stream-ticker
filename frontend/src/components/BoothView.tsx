import React, { useState, useEffect } from 'react';
import PartyCard from './PartyCard';
import LeadingParties from './LeadingParties';
import VotingStats from './VotingStats';
import Candidates from './Candidates';
import LeadingCandidates from './LeadingCandidates';
import { motion } from 'framer-motion';

interface BoothViewProps {
  boothName: string;
  boothNumber?: string | null;
  partyData: any[];
  notaData?: { candidates: { id?: string; photo: string; name: string; position: string; votes: number }[] };
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
  notaData,
  pendingVotes,
  countingPercentage,
  candidateComparison,
  onSwitch,
  autoSwitchInterval = 10000 // Default 10 seconds
}) => {

  console.log("BoothView partyData:", partyData);
  console.log("notaData:", notaData);
  

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
      totalVotes: president.votes // Fallback if booth data is not provided
    })),
    secretaries: candidateComparison.secretaries.map(secretary => ({
      ...secretary,
      totalVotes: secretary.votes
    })),
    treasurers: candidateComparison.treasurers.map(treasurer => ({
      ...treasurer,
      totalVotes: treasurer.votes
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
          <div className="flex-grow grid grid-cols-3 gap-3 h-[40%]">
            {partyData
              .filter(party => !["NOTA", "Nota", "nota"].includes(party.partyName))
              .map((party, index) => (
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

          <div className="h-[25%]">
            <div className='bg-white rounded-lg shadow-lg overflow-hidden h-full'>
              <motion.div
                className="py-2 px-4 text-white font-bold text-center bg-gray-600"

                transition={{ duration: 0.5 }}
              >
                NOTA VOTES
              </motion.div>

                <div className="bg-white p-3 flex-1 overflow-auto">
                  {notaData?.candidates?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                  {notaData.candidates.map((candidate, index) => (
                  <div
                    key={candidate.id || index}
                    className="p-3 rounded-md border flex-shrink-0 w-[calc(33.333%-0.75rem)]"
                  >
                    <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                    <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-10 h-10 rounded-full object-cover"
                    />
                    </div>
                    <div className="flex-grow">
                    <p className="text-sm font-medium">{candidate.position}</p>
                    </div>
                    <div className="flex-grow text-right">
                    <span className="text-lg font-bold">{candidate.votes} votes</span>
                    </div>
                    </div>
                  </div>
                  ))}
                  </div>
                  ) : (
                  <p>No NOTA votes available.</p>
                  )}
                </div>
            </div>
          </div>
        </div>

        {/* Right column (2/5 width) */}
        <div className="col-span-2 flex flex-col gap-3 h-full">
          <div className="h-[32%]">
            <LeadingParties partyData={processedPartyData} />
          </div>

          <div className="h-[32%]">
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
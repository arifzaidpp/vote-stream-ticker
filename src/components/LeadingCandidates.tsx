import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface CandidateData {
  name: string;
  partyName: string;
  partyColor: string;
  votes: number;
  constituency: string;
}

interface LeadingCandidatesProps {
  president: CandidateData;
  secretary: CandidateData;
  treasurer: CandidateData;
}

const LeadingCandidates: React.FC<LeadingCandidatesProps> = ({ president, secretary, treasurer }) => {
  const renderCandidateCard = (candidate: CandidateData, role: string) => (
    <div className="w-full max-w-md bg-white rounded-lg overflow-hidden shadow-lg mb-4">
      {/* Top section with role */}
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center text-xl font-bold">
        <span className="block text-sm font-normal">{candidate.name}</span>
        <span className="block text-sm font-normal">{role}</span>
      </div>
      <div className="flex">
        {/* Left section with full-height image */}
        <div className="w-2/5">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
            alt={candidate.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right section with content */}
        <div className="w-3/5 flex flex-col">
            <div className="p-3 h-3/5 bg-white flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{candidate.partyName}</span>
              <span className="text-2xl font-bold">{candidate.votes}</span>
            </div>
            </div>

          {/* Leading status */}
          <div
            className={cn(
              'p-2 text-white text-center h-2/5 relative',
              candidate.partyColor === 'blue' ? 'bg-blue-600' :
                candidate.partyColor === 'green' ? 'bg-green-600' :
                  candidate.partyColor === 'orange' ? 'bg-orange-500' : 'bg-gray-600'
            )}
          >
            <div className="absolute bottom-2 right-2">
              <p className="text-2xl p-2 font-bold">Leading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 space-y-4">
      {renderCandidateCard(president, 'President')}
      {renderCandidateCard(secretary, 'Secretary')}
      {renderCandidateCard(treasurer, 'Treasurer')}
    </div>
  );
};

export default LeadingCandidates;


import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface CandidateData {
  name: string;
  partyName: string;
  partyColor: string;
  votes: number;
}

interface LeadingCandidatesProps {
  president: CandidateData;
  secretary: CandidateData;
  treasurer: CandidateData;
}

const CandidateCard = ({ candidate, position }: { candidate: CandidateData, position: string }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 border-blue-700';
      case 'green':
        return 'bg-green-600 border-green-700';
      case 'orange':
        return 'bg-orange-500 border-orange-600';
      default:
        return 'bg-gray-600 border-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-3 text-center border-b border-gray-100">
        <div className="font-semibold text-gray-800">{candidate.name}</div>
        <div className="text-sm text-gray-500">{position}</div>
      </div>
      
      <div className="flex items-center p-3">
        <Avatar className="h-16 w-16 border-2 border-white/20 rounded-md">
          <AvatarImage 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`} 
            className="object-cover"
          />
          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="ml-3 flex-1">
          <div className={cn(
            "rounded px-3 py-2 text-white",
            getColorClasses(candidate.partyColor)
          )}>
            <div className="flex justify-between items-center">
              <span className="font-bold">{candidate.partyName}</span>
              <span className="text-sm opacity-90">LEADING</span>
            </div>
            <div className="text-xl font-bold mt-1">
              {candidate.votes.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadingCandidates: React.FC<LeadingCandidatesProps> = ({ 
  president, 
  secretary, 
  treasurer 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 h-full">
      <h2 className="text-lg font-bold mb-3 text-center">Leading Candidates</h2>
      
      <div className="space-y-3">
        <CandidateCard candidate={president} position="President" />
        <CandidateCard candidate={secretary} position="Secretary" />
        <CandidateCard candidate={treasurer} position="Treasurer" />
      </div>
    </div>
  );
};

export default LeadingCandidates;

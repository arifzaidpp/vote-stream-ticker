import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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

const LeadingCandidates: React.FC<LeadingCandidatesProps> = ({ president, secretary, treasurer }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 text-white';
      case 'green':
        return 'bg-green-600 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 h-full">
      <h2 className="text-lg font-bold mb-3 text-center">Leading Parties</h2>

      <div className="grid grid-cols-3 gap-2 h-[calc(100%-2rem)]">
        <div className="flex flex-col">
          <div className="bg-blue-50 p-2 rounded-md mb-1 text-center">
            <h3 className="font-bold text-blue-800 text-sm">Party A</h3>
          </div>
          <div className={cn(
            "relative rounded-md flex-1 flex flex-col justify-between overflow-hidden",
            getColorClasses(president.partyColor)
          )}>
            <img
              className="absolute inset-0 w-full h-full object-contain"
              src="https://miro.medium.com/v2/resize:fit:2400/1*32fVfsm5mgnhFHfAbd-Itg.png"
              alt={president.name}
            />
            <div className="relative z-10 p-2 text-right">
              <div className="text-sm font-semibold">{president.name}</div>
              <div className="text-xs opacity-80">{president.partyName}</div>
            </div>
            <div className="relative z-10 p-2 text-right">
              <span className="font-bold text-lg">{president.votes}</span>
              <span className="ml-1 text-xs opacity-80">votes</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="bg-green-50 p-2 rounded-md mb-1 text-center">
            <h3 className="font-bold text-green-800 text-sm">Party B</h3>
          </div>
          <div className={cn(
            "relative rounded-md flex-1 flex flex-col justify-between overflow-hidden",
            getColorClasses(secretary.partyColor)
          )}>
            <img
              className="absolute inset-0 w-full h-full object-contain"
              src="https://miro.medium.com/v2/resize:fit:2400/1*32fVfsm5mgnhFHfAbd-Itg.png"
              alt={secretary.name}
            />
            <div className="relative z-10 p-2 text-right">
              <div className="text-sm font-semibold">{secretary.name}</div>
              <div className="text-xs opacity-80">{secretary.partyName}</div>
            </div>
            <div className="relative z-10 p-2 text-right">
              <span className="font-bold text-lg">{secretary.votes}</span>
              <span className="ml-1 text-xs opacity-80">votes</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="bg-yellow-50 p-2 rounded-md mb-1 text-center">
            <h3 className="font-bold text-yellow-800 text-sm">Party C</h3>
          </div>
          <div className={cn(
            "relative rounded-md flex-1 flex flex-col justify-between overflow-hidden",
            getColorClasses(treasurer.partyColor)
          )}>
            <img
              className="absolute inset-0 w-full h-full object-contain"
              src="https://miro.medium.com/v2/resize:fit:2400/1*32fVfsm5mgnhFHfAbd-Itg.png"
              alt={treasurer.name}
            />
            <div className="relative z-10 p-2 text-right">
              <div className="text-sm font-semibold">{treasurer.name}</div>
              <div className="text-xs opacity-80">{treasurer.partyName}</div>
            </div>
            <div className="relative z-10 p-2 text-right">
              <span className="font-bold text-lg">{treasurer.votes}</span>
              <span className="ml-1 text-xs opacity-80">votes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadingCandidates;
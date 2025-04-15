
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
      <h2 className="text-lg font-bold mb-3 text-center">Leading Candidates</h2>
      
      <div className="space-y-2">
        <div className="flex flex-col">
          <div className="bg-blue-50 p-2 rounded-md mb-1 text-center">
            <h3 className="font-bold text-blue-800 text-sm">President</h3>
          </div>
          <div className={cn(
            "rounded-md p-2 flex items-center space-x-3",
            getColorClasses(president.partyColor)
          )}>
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${president.name}`} />
              <AvatarFallback>{president.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-semibold">{president.name}</div>
              <div className="text-xs opacity-80">{president.partyName}</div>
              <div className="mt-1">
                <span className="font-bold text-lg">{president.votes}</span>
                <span className="ml-1 text-xs opacity-80">votes</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="bg-green-50 p-2 rounded-md mb-1 text-center">
            <h3 className="font-bold text-green-800 text-sm">Secretary</h3>
          </div>
          <div className={cn(
            "rounded-md p-2 flex items-center space-x-3",
            getColorClasses(secretary.partyColor)
          )}>
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${secretary.name}`} />
              <AvatarFallback>{secretary.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-semibold">{secretary.name}</div>
              <div className="text-xs opacity-80">{secretary.partyName}</div>
              <div className="mt-1">
                <span className="font-bold text-lg">{secretary.votes}</span>
                <span className="ml-1 text-xs opacity-80">votes</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="bg-yellow-50 p-2 rounded-md mb-1 text-center">
            <h3 className="font-bold text-yellow-800 text-sm">Treasurer</h3>
          </div>
          <div className={cn(
            "rounded-md p-2 flex items-center space-x-3",
            getColorClasses(treasurer.partyColor)
          )}>
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${treasurer.name}`} />
              <AvatarFallback>{treasurer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-semibold">{treasurer.name}</div>
              <div className="text-xs opacity-80">{treasurer.partyName}</div>
              <div className="mt-1">
                <span className="font-bold text-lg">{treasurer.votes}</span>
                <span className="ml-1 text-xs opacity-80">votes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadingCandidates;

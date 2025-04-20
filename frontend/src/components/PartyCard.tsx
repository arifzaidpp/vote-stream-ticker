import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PartyCardProps {
  partyName: string;
  color: string;
  candidates: Array<{
    name: string;
    position: string;
    photo?: string;
    votes: number;
  }>;
  boothName?: string;
  logo?: string;
}

const PartyCard: React.FC<PartyCardProps> = ({ partyName, color, candidates, boothName, logo }) => {
  const [voteUpdated, setVoteUpdated] = useState<Record<string, boolean>>({});
  
  console.log("PartyCard candidates:", candidates);
  
  useEffect(() => {
    candidates.forEach(candidate => {
      const key = `${candidate.name}-${candidate.position}`;
      setVoteUpdated(prev => ({ ...prev, [key]: true }));
      
      const timer = setTimeout(() => {
        setVoteUpdated(prev => ({ ...prev, [key]: false }));
      }, 2000);
      
      return () => clearTimeout(timer);
    });
  }, [candidates]);
  
  const getColorClasses = () => {
    // Handle hex colors or named colors
    if (color?.startsWith('#')) {
      // For hex colors, we use inline style
      return '';
    }
    
    switch (color?.toLowerCase()) {
      case 'blue':
        return 'bg-blue-600 border-blue-700';
      case 'green':
        return 'bg-green-600 border-green-700';
      case 'red':
        return 'bg-red-600 border-red-700';
      case 'orange':
        return 'bg-orange-500 border-orange-600';
      case 'purple':
        return 'bg-purple-600 border-purple-700';
      case 'teal':
        return 'bg-teal-600 border-teal-700';
      default:
        return 'bg-gray-600 border-gray-700';
    }
  };
  
  const colorStyle = color?.startsWith('#') ? { backgroundColor: color, borderColor: color } : {};
  
  return (
    <div className={cn(
      "rounded-lg shadow-lg border-t-2 overflow-hidden h-full flex flex-col",
      getColorClasses())}>
      <div className={cn("py-2 px-4 text-white font-bold text-lg flex items-center justify-between", getColorClasses())} style={colorStyle}>
      <span className="text-xl">{partyName}</span>
        {boothName && (
           <span className="text-sm bg-white/20 px-3 py-1 rounded">
           {boothName}
         </span>
        )}
        {logo && (
          <img src={logo} alt={`${partyName} logo`} className="h-8 w-8" />
        )}
      </div>
      
      <div className="bg-white p-3 flex-1 overflow-auto">
        {candidates.map((candidate, index) => {
          const key = `${candidate.name}-${candidate.position}`;
          const isUpdated = voteUpdated[key];
          
          return (
            <div 
              key={key} 
              className={cn(
              "mb-3 last:mb-0 p-3 rounded-md border transition-all",
              voteUpdated[key] ? 'animate-vote-update' : '',
              index === 0 ? 'bg-blue-50 border-blue-200' : 
              index === 1 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              )}
            >
              <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Avatar className="h-12 w-12 border-2" style={{ borderColor: color?.startsWith('#') ? color : undefined }}>
                <AvatarImage 
                  src={candidate.photo ||`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} 
                  alt={candidate.name} 
                  className="rounded-full object-cover"
                  style={color?.startsWith('#') ? { backgroundColor: color } : {}}
                />
                <AvatarFallback className={cn("text-white", getColorClasses())} style={colorStyle}>
                  {candidate.name.charAt(0)}
                </AvatarFallback>
                {/* If there's a candidate photo, it would go in AvatarImage */}
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                <div className="text-sm text-gray-500 uppercase">
                  {candidate.position}
                  <span className="hidden text-sm"> Candidate</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900 truncate text-xl">
                  {candidate.name}
                  </div>
                  
                  <div className={cn(
                  "font-semibold text-sm", 
                  voteUpdated[key] ? "text-green-600" : "text-gray-700"
                  )}>
                  <span className="tabular-nums text-xl">{candidate.votes}</span>
                  <span className="ml-1 text-sm text-gray-500">votes</span>
                  </div>
                </div>
                </div>
              </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartyCard;
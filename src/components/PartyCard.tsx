
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const PartyCard = ({ partyName, color, candidates, boothName, logo }) => {
  const [voteUpdated, setVoteUpdated] = useState({});
  
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
    <div className={cn(
      "rounded-lg shadow-lg border-t-2 overflow-hidden h-full",
      getColorClasses()
    )}>
      <div className={cn(
        "py-1 px-3 text-white font-semibold text-base flex items-center justify-between",
        color === 'blue' ? 'bg-blue-700' : 
        color === 'green' ? 'bg-green-700' : 
        color === 'orange' ? 'bg-orange-600' : 
        'bg-gray-700'
      )}>
        <span>{partyName}</span>
        {boothName && (
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
            {boothName}
          </span>
        )}
        {logo && (
          <img src={logo} alt={`${partyName} logo`} className="h-6 w-6" />
        )}
      </div>
      
      <div className="bg-white p-2 overflow-auto h-[calc(100%-2rem)]">
        {candidates.map((candidate, index) => {
          const key = `${candidate.name}-${candidate.position}`;
          return (
            <div 
              key={index}
              className={cn(
                "mb-2 last:mb-0 p-2 rounded-md border transition-all",
                voteUpdated[key] ? 'animate-vote-update' : '',
                index === 0 ? 'bg-blue-50 border-blue-200' : 
                index === 1 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              )}
            >
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 border-2 border-gray-200">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                  <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-xs">{candidate.position}</h3>
                    <span className="text-xs text-gray-500">Candidate</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">{candidate.name}</h4>
                    <div className="flex items-center">
                      <span className="font-bold text-base text-blue-600">{candidate.votes}</span>
                      <span className="ml-1 text-xs text-gray-500">votes</span>
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

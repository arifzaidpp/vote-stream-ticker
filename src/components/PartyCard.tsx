
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Candidate {
  name: string;
  position: string;
  votes: number;
}

interface PartyCardProps {
  partyName: string;
  color: string;
  candidates: Candidate[];
  logo?: string;
}

const PartyCard: React.FC<PartyCardProps> = ({ partyName, color, candidates, logo }) => {
  const [voteUpdated, setVoteUpdated] = useState<{ [key: string]: boolean }>({});
  
  // Simulate vote update animation when votes change
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
  
  // Get color classes based on party color
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
      "rounded-lg shadow-lg border-t-4 overflow-hidden",
      getColorClasses()
    )}>
      <div className={cn(
        "py-3 px-4 text-white font-bold text-xl flex items-center justify-between",
        color === 'blue' ? 'bg-blue-700' : 
        color === 'green' ? 'bg-green-700' : 
        color === 'orange' ? 'bg-orange-600' : 
        'bg-gray-700'
      )}>
        <span>{partyName}</span>
        {logo && (
          <img src={logo} alt={`${partyName} logo`} className="h-8 w-8" />
        )}
      </div>
      
      <div className="bg-white p-4">
        {candidates.map((candidate, index) => {
          const key = `${candidate.name}-${candidate.position}`;
          return (
            <div 
              key={index}
              className={cn(
                "mb-4 last:mb-0 p-3 rounded-md border transition-all",
                voteUpdated[key] ? 'animate-vote-update' : '',
                index === 0 ? 'bg-blue-50 border-blue-200' : 
                index === 1 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-gray-800">{candidate.position}</h3>
                <span className="text-sm text-gray-500">Candidate</span>
              </div>
              
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">{candidate.name}</h4>
                <div className="flex items-center">
                  <span className="font-bold text-xl text-blue-600">{candidate.votes}</span>
                  <span className="ml-1 text-sm text-gray-500">votes</span>
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

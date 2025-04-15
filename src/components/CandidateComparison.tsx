
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Candidate {
  name: string;
  partyName: string;
  partyColor: string;
  votes: number;
  rank: number;
}

interface CandidateComparisonProps {
  presidents: Candidate[];
  secretaries: Candidate[];
  treasurers: Candidate[];
}

const CandidateComparison: React.FC<CandidateComparisonProps> = ({ 
  presidents, secretaries, treasurers 
}) => {
  const [activePosition, setActivePosition] = useState<'president' | 'secretary' | 'treasurer'>('president');
  const [transitionActive, setTransitionActive] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTransitionActive(true);
      setTimeout(() => {
        setActivePosition(current => {
          if (current === 'president') return 'secretary';
          if (current === 'secretary') return 'treasurer';
          return 'president';
        });
        
        setTimeout(() => {
          setTransitionActive(false);
        }, 500);
      }, 500);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-500';
      case 'green':
        return 'border-green-500';
      case 'orange':
        return 'border-orange-500';
      default:
        return 'border-gray-500';
    }
  };
  
  const getActiveCandidates = () => {
    if (activePosition === 'president') return presidents;
    if (activePosition === 'secretary') return secretaries;
    return treasurers;
  };
  
  const getPositionTitle = () => {
    if (activePosition === 'president') return 'Presidential Candidates';
    if (activePosition === 'secretary') return 'Secretary Candidates';
    return 'Treasurer Candidates';
  };
  
  const getPositionColor = () => {
    if (activePosition === 'president') return 'bg-blue-700';
    if (activePosition === 'secretary') return 'bg-green-700';
    return 'bg-yellow-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
      <div className={cn(
        "py-2 px-4 text-white font-bold text-center",
        getPositionColor()
      )}>
        {getPositionTitle()}
      </div>
      
      <div className={cn(
        "p-2 transition-all duration-1000 opacity-100",
        transitionActive ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      )}>
        <div className="grid grid-cols-3 gap-2">
          {getActiveCandidates().map((candidate, index) => (
            <div 
              key={index}
              className={cn(
                "flex flex-col justify-between p-2 rounded-md border-l-4 bg-gray-50",
                getColorClasses(candidate.partyColor)
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{candidate.name}</h3>
                  <p className="text-xs text-gray-500">{candidate.partyName}</p>
                </div>
                <div className="bg-gray-200 text-gray-700 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {candidate.rank}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Votes</span>
                <span className="font-bold text-lg">{candidate.votes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateComparison;

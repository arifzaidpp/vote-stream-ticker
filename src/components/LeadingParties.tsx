
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'framer-motion';

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

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation periodically
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const partyData = [
    { name: 'Party A', color: 'bg-blue-50', textColor: 'text-blue-800', candidate: president },
    { name: 'Party B', color: 'bg-green-50', textColor: 'text-green-800', candidate: secretary },
    { name: 'Party C', color: 'bg-yellow-50', textColor: 'text-yellow-800', candidate: treasurer }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 h-full">
      <h2 className="text-lg font-bold mb-2 text-center">Leading Parties</h2>

      <div className="grid grid-cols-3 gap-2 h-[calc(100%-2.5rem)]">
        {partyData.map((party, index) => (
          <div key={index} className="flex flex-col">
            <motion.div 
              className={cn("p-1.5 rounded-md mb-1 text-center", party.color)}
              animate={animate ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <h3 className={cn("font-bold text-sm", party.textColor)}>{party.name}</h3>
            </motion.div>
            <motion.div 
              className={cn(
                "relative rounded-md flex-1 flex flex-col justify-between overflow-hidden",
                getColorClasses(party.candidate.partyColor)
              )}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className="absolute inset-0 opacity-40"
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${party.candidate.name}`}
                    className="object-cover w-full h-full opacity-40"
                  />
                  <AvatarFallback className="w-full h-full">{party.candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="relative z-10 p-2 text-right">
                <div className="text-sm font-semibold">{party.candidate.name}</div>
                <div className="text-xs opacity-80">{party.candidate.partyName}</div>
              </div>
              <motion.div 
                className="relative z-10 p-2 text-right"
                animate={animate ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <span className="font-bold text-lg">{party.candidate.votes}</span>
                <span className="ml-1 text-xs opacity-80">votes</span>
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadingCandidates;

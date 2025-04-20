import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CandidateData {
  name: string;
  partyName: string;
  partyColor: string;
  photo?: string;
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
      case 'red':
        return 'bg-red-600 text-white';
      case 'purple':
        return 'bg-purple-600 text-white';
      case 'teal':
        return 'bg-teal-600 text-white';
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
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const positions = [
    { title: 'President', color: 'bg-blue-50', textColor: 'text-blue-800', candidate: president },
    { title: 'Secretary', color: 'bg-green-50', textColor: 'text-green-800', candidate: secretary },
    { title: 'Treasurer', color: 'bg-yellow-50', textColor: 'text-yellow-800', candidate: treasurer }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
      <motion.div 
        className="py-2 px-4 text-white font-bold text-center bg-blue-600"
        animate={animate ? { backgroundColor: ['#2563eb', '#3b82f6', '#2563eb'] } : {}}
        transition={{ duration: 0.5 }}
      >
        Leading Candidates
      </motion.div>

      <div className="grid grid-cols-3 gap-2 p-2 h-[calc(100%-6.5rem)]">
        {positions.map((position, index) => (
          <div key={index} className="flex flex-col">
            <motion.div 
              className={cn("p-1.5 rounded-md mb-1 text-center", position.color)}
              animate={animate ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <h3 className={cn("font-bold text-sm", position.textColor)}>{position.title}</h3>
            </motion.div>
            <motion.div 
              className={cn(
              "relative rounded-md flex-1 flex flex-col justify-between overflow-hidden",
              getColorClasses(position.candidate.partyColor)
              )}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
              className="absolute inset-0 bg-gradient-to-l from-black to-transparent"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.img
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              src={position.candidate.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${position.candidate.name}`}
              alt={position.candidate.name}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 10, repeat: Infinity }}
              />
              <div className="relative z-10 p-2 text-right">
              <div className="text-lg font-semibold">{position.candidate.name}</div>
              <div className="text-md opacity-80">{position.candidate.partyName}</div>
              </div>
              <motion.div 
              className="relative z-10 p-2 text-right"
              animate={animate ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
              >
              <span className="font-bold text-xl">{position.candidate.votes}</span>
              <span className="ml-1 text-md opacity-80">votes</span>
              </motion.div>
            </motion.div>
          </div>
      ))}
      </div>
    </div>
  );
};

export default LeadingCandidates;
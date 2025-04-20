import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'framer-motion';

interface PartyData {
  id: string;
  name: string;
  color: string;
  logo?: string;
  votes: number;
}

interface LeadingPartiesProps {
  partyData: PartyData[];
}

const LeadingParties: React.FC<LeadingPartiesProps> = ({ partyData }) => {
  const getColorClasses = (color: string) => {
    // Handle hex colors or named colors
    if (color?.startsWith('#')) {
      // For hex colors, we use inline style
      return 'text-white'; // Default text color for custom hex backgrounds
    }
    
    switch (color?.toLowerCase()) {
      case 'blue':
        return 'bg-blue-600 text-white';
      case 'green':
        return 'bg-green-600 text-white';
      case 'red':
        return 'bg-red-600 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      case 'purple':
        return 'bg-purple-600 text-white';
      case 'teal':
        return 'bg-teal-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getColorBgClasses = (color: string) => {
    if (color?.startsWith('#')) {
      return 'bg-opacity-10 text-gray-800'; // Light background with dark text for hex colors
    }
    
    switch (color?.toLowerCase()) {
      case 'blue':
        return 'bg-blue-50 text-blue-800';
      case 'green':
        return 'bg-green-50 text-green-800';
      case 'red':
        return 'bg-red-50 text-red-800';
      case 'orange':
        return 'bg-orange-50 text-orange-800';
      case 'purple':
        return 'bg-purple-50 text-purple-800';
      case 'teal':
        return 'bg-teal-50 text-teal-800';
      default:
        return 'bg-gray-50 text-gray-800';
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

  // Sort parties by votes and get top 3
  const topParties = [...partyData]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);
  
  // Add ranking position
  const rankedParties = topParties.map((party, index) => ({
    ...party,
    position: index + 1
  }));
  
  // Fill with placeholder data if we have fewer than 3 parties
  while (rankedParties.length < 3) {
    rankedParties.push({
      id: `placeholder-${rankedParties.length}`,
      name: 'N/A',
      color: 'gray',
      votes: 0,
      position: rankedParties.length + 1
    });
  }

  // Convert position numbers to text
  const positionText = {
    1: 'First',
    2: 'Second',
    3: 'Third'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 h-full">
      <h2 className="text-lg font-bold mb-2 text-center">Leading Parties</h2>

      <div className="grid grid-cols-3 gap-2 h-[calc(100%-2.5rem)]">
        {rankedParties.map((party, index) => {
          // Create inline style for hex colors
          const colorStyle = party.color?.startsWith('#') ? { backgroundColor: party.color } : {};
          const bgColorStyle = party.color?.startsWith('#') ? { 
            backgroundColor: `${party.color}1A`, // Adding 1A for 10% opacity in hex
            color: party.color 
          } : {};
          
          return (
            <div key={party.id || index} className="flex flex-col">
              <motion.div 
                className={cn("p-1.5 rounded-md mb-1 text-center", getColorBgClasses(party.color))}
                style={bgColorStyle}
                animate={animate ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-bold text-sm">{positionText[party.position as keyof typeof positionText]}</h3>
              </motion.div>
              <motion.div 
                className={cn(
                  "relative rounded-md flex-1 flex flex-col justify-between overflow-hidden",
                  getColorClasses(party.color)
                )}
                style={colorStyle}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Logo container with higher opacity */}
                <div className="absolute inset-0 pr-10 flex items-center justify-center">
                  <Avatar className="w-24 h-24 rounded-none">
                    {party.logo ? (
                      <AvatarImage 
                        src={party.logo}
                        className="object-contain opacity-75"
                      />
                    ) : (
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${party.name}`}
                        className="object-contain opacity-75"
                      />
                    )}
                    <AvatarFallback className="text-4xl opacity-75">{party.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Content overlay with semi-transparent background */}
                <div className="relative z-10 p-2 text-right bg-opacity-20 mt-2 rounded-t-md">
                  <div className="text-lg font-semibold">{party.name}</div>
                </div>
                <motion.div 
                  className="relative z-10 p-2 text-right bg-opacity-20 mb-2 rounded-b-md"
                  animate={animate ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <span className="font-bold text-2xl">{party.votes}</span>
                  <span className="ml-1 text-base opacity-80">votes</span>
                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadingParties;
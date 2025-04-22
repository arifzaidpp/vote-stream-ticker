import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { motion } from 'framer-motion';

// Helper function to create a lighter version of a hex color for backgrounds
const lightenColor = (hex, opacity = 0.15) => {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return rgba with reduced opacity for a lighter effect
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const Candidates = ({ presidents, secretaries, treasurers }) => {
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);

  // Combine all candidates from different positions
  const allCandidates = [
    ...presidents.map(c => ({ ...c, position: 'PRESIDENT' })),
    ...secretaries.map(c => ({ ...c, position: 'SECRETARY' })),
    ...treasurers.map(c => ({ ...c, position: 'TREASURER' }))
  ];

  // Find leaders for each position
  const leaders = {
    PRESIDENT: presidents.length > 0 ? Math.max(...presidents.map(c => c.totalVotes || c.votes || 0), 0) : 0,
    SECRETARY: secretaries.length > 0 ? Math.max(...secretaries.map(c => c.totalVotes || c.votes || 0), 0) : 0,
    TREASURER: treasurers.length > 0 ? Math.max(...treasurers.map(c => c.totalVotes || c.votes || 0), 0) : 0
  };

  // Calculate total votes for each position
  const totalVotesByPosition = {
    PRESIDENT: presidents.reduce((sum, c) => sum + (c.totalVotes || c.votes || 0), 0),
    SECRETARY: secretaries.reduce((sum, c) => sum + (c.totalVotes || c.votes || 0), 0),
    TREASURER: treasurers.reduce((sum, c) => sum + (c.totalVotes || c.votes || 0), 0)
  };

  // Set up auto play for carousel
  useEffect(() => {
    if (allCandidates.length === 0) return;

    const interval = setInterval(() => {
      setAutoPlayIndex((current) => (current + 1) % allCandidates.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allCandidates.length]);

  if (allCandidates.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg py-6 px-6 h-full flex items-center justify-center border border-gray-100">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No candidate data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg py-3 px-4 h-96 max-h-full overflow-hidden border border-gray-100">
      <h2 className="text-lg font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Candidate Details</h2>

      <Carousel
        className="h-[calc(100%-2.5rem)]"
        opts={{ loop: true, startIndex: autoPlayIndex }}
      >
        <CarouselContent className="h-full">
        {allCandidates.map((candidate, index) => {
            // Calculate total votes and percentage
            const totalVotes = candidate.totalVotes || candidate.votes || 0;
            const totalVotesForPosition = totalVotesByPosition[candidate.position] || 1;
            const percentage = candidate.percentage || Math.round((totalVotes / totalVotesForPosition) * 100);
            const isLeading = leaders[candidate.position] === totalVotes && totalVotes > 0;
            
            // Create background styles with lighter versions of party colors
            const imageBackgroundStyle = {
              backgroundColor: candidate.partyColor ? lightenColor(candidate.partyColor) : '#f9fafb'
            };

            return (
              <CarouselItem key={index} className="h-full">
                <div className="flex flex-row items-center gap-4 h-full pb-2">
                  <div className="flex-shrink-0 w-1/3">
                    {candidate.photo ? (
                      <div 
                        className={cn(
                          "rounded-lg overflow-hidden shadow-md transition-all duration-300",
                          isLeading ? "border-2 border-yellow-400" : "border-2 border-gray-100"
                        )}
                        style={imageBackgroundStyle}
                      >
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className={cn(
                          "rounded-lg overflow-hidden shadow-md transition-all duration-300",
                          isLeading ? "border-2 border-yellow-400" : "border-2 border-gray-100"
                        )}
                        style={imageBackgroundStyle}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
                          alt={candidate.name}
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                  <div className="relative z-10 flex flex-col flex-grow h-full overflow-hidden p-3 pr-4">
                    <div className="mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <motion.h3
                            className="font-bold text-xl text-black drop-shadow-md"
                          >
                            {candidate.name}
                          </motion.h3>
                          <p className="text-sm text-gray-700 font-medium mb-1">{candidate.partyName}</p>
                          
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-bold px-3 py-1 rounded-full transition-all duration-300 bg-black/10 backdrop-blur-sm border-black/30 text-blue-700"
                            >
                              {candidate.position}
                            </Badge>

                            {isLeading && (
                              <Badge
                                variant="secondary"
                                className="bg-green-500 text-white border border-green-400 text-xs rounded-full px-3 py-1 flex items-center gap-1 backdrop-blur-sm font-bold"
                              >
                                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                                LEADING
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <motion.div
                            className="text-3xl font-black text-blue-700 drop-shadow-md"
                          >
                            {percentage}%
                          </motion.div>
                          <div className="text-xs text-gray-600">Vote Share</div>
                          
                          <motion.div
                            className="text-3xl font-black text-blue-700 drop-shadow-md mt-2"
                          >
                            {totalVotes.toLocaleString()}
                          </motion.div>
                          <div className="text-xs text-gray-600">Total Votes</div>
                        </div>
                      </div>
                    </div>

                    {/* Votes progress */}
                    <div className="mt-auto w-full">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-800 drop-shadow-md">Total Votes</p>
                        <motion.p
                          className="text-sm font-bold text-black drop-shadow-md"
                        >
                          {totalVotes.toLocaleString()}/{totalVotesForPosition.toLocaleString()}
                        </motion.p>
                      </div>
                      <div className="w-full bg-black/10 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
                        <motion.div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor:  '#3b82f6',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 pb-1">
          {allCandidates.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === autoPlayIndex ? "bg-blue-600 w-4" : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => setAutoPlayIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default Candidates;
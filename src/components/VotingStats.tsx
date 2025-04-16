
import React from 'react';

interface VotingStatsProps {
  totalVotes: number;
  pendingVotes: number;
  countingPercentage: number;
}

const VotingStats: React.FC<VotingStatsProps> = ({ 
  totalVotes, 
  pendingVotes, 
  countingPercentage 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-2 h-full">
      <h2 className="text-lg font-bold mb-1 text-center">Voting Stats</h2>
      
      <div className="grid grid-cols-3 gap-2 h-[calc(100%-2rem)] items-center">
        <div className="bg-blue-50 p-2 rounded-md text-center h-full flex flex-col justify-center">
          <h3 className="text-xs text-gray-600">Total Votes</h3>
          <p className="text-xl font-bold text-blue-600">{totalVotes}</p>
        </div>
        
        <div className="bg-yellow-50 p-2 rounded-md text-center h-full flex flex-col justify-center">
          <h3 className="text-xs text-gray-600">Pending</h3>
          <p className="text-xl font-bold text-yellow-600">{pendingVotes}</p>
        </div>
        
        <div className="bg-green-50 p-2 rounded-md text-center h-full flex flex-col justify-center">
          <h3 className="text-xs text-gray-600">Completed</h3>
          <p className="text-xl font-bold text-green-600">{countingPercentage}%</p>
        </div>
      </div>
      
      {/* <div className="mt-2 bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-blue-600 h-1.5 rounded-full" 
          style={{ width: `${countingPercentage}%` }}
        ></div>
      </div> */}
    </div>
  );
};

export default VotingStats;

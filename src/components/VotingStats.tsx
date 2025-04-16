
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
  // Data for the pie chart
  const data = [
    { name: 'Counted', value: totalVotes, color: '#4ade80' },
    { name: 'Pending', value: pendingVotes, color: '#fbbf24' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-2 h-full flex flex-col">
      <h2 className="text-lg font-bold text-center mb-1">Voting Stats</h2>
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Chart section */}
        <div className="w-full md:w-1/2 h-28 md:h-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1000}
                animationBegin={200}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} votes`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats section */}
        <div className="grid grid-cols-3 gap-1 w-full md:w-1/2 h-16 md:h-auto">
          <div className="bg-blue-50 p-1 rounded-md text-center flex flex-col justify-center">
            <h3 className="text-xs text-gray-600">Total</h3>
            <p className="text-sm md:text-lg font-bold text-blue-600">{totalVotes}</p>
          </div>
          
          <div className="bg-yellow-50 p-1 rounded-md text-center flex flex-col justify-center">
            <h3 className="text-xs text-gray-600">Pending</h3>
            <p className="text-sm md:text-lg font-bold text-yellow-600">{pendingVotes}</p>
          </div>
          
          <div className="bg-green-50 p-1 rounded-md text-center flex flex-col justify-center">
            <h3 className="text-xs text-gray-600">Complete</h3>
            <p className="text-sm md:text-lg font-bold text-green-600">{countingPercentage}%</p>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-1 bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-in-out" 
          style={{ width: `${countingPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default VotingStats;

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

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
  // Data for total votes chart
  const totalData = [
    { name: 'Counted', value: totalVotes, color: '#2563eb' },
    { name: 'Pending', value: pendingVotes, color: '#94a3b8' }
  ];

  // Data for pending votes chart
  const pendingData = [
    { name: 'Pending', value: pendingVotes, color: '#eab308' },
    { name: 'Other', value: totalVotes, color: '#e2e8f0' }
  ];

  // Data for completion chart
  const completionData = [
    { name: 'Completed', value: countingPercentage, color: '#22c55e' },
    { name: 'Remaining', value: 100 - countingPercentage, color: '#e2e8f0' }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 h-full">
      <div className="flex items-center px-2 justify-between mb-1">
        <h2 className="text-lg font-bold">Voting Statistics</h2>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"/>
          <span className="text-xs text-gray-500">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[calc(100%-3rem)]">
        {/* Total Votes Card */}
        <motion.div 
          className="bg-blue-50 rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-center mb-1">
            <p className="text-sm text-gray-600">Total Votes</p>
            <p className="text-xl font-bold text-blue-600">{totalVotes.toLocaleString()}</p>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={20}
                  outerRadius={40}
                  dataKey="value"
                >
                  {totalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pending Votes Card */}
        <motion.div 
          className="bg-yellow-50 rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-center mb-1">
            <p className="text-sm text-gray-600">Pending Votes</p>
            <p className="text-xl font-bold text-yellow-600">{pendingVotes.toLocaleString()}</p>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pendingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={20}
                  outerRadius={40}
                  dataKey="value"
                >
                  {pendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Completion Card */}
        <motion.div 
          className="bg-green-50 rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-center mb-1">
            <p className="text-sm text-gray-600">Completion</p>
            <p className="text-xl font-bold text-green-600">{countingPercentage}%</p>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={20}
                  outerRadius={40}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Progress bar */}
      {/* <div className="mt-4 bg-gray-200 rounded-full h-2">
        <motion.div 
          className="bg-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${countingPercentage}%` }}
          transition={{ duration: 1 }}
        />
      </div> */}
    </div>
  );
};

export default VotingStats;
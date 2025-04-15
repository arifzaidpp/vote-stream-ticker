
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ResultsChartProps {
  data: ChartData[];
  totalVotes: number;
  pendingVotes: number;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ data, totalVotes, pendingVotes }) => {
  const completeData = [
    ...data,
    { name: 'Pending', value: pendingVotes, color: '#d1d5db' } // gray color for pending votes
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <h2 className="text-xl font-bold mb-4 text-center">Vote Distribution</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={completeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={1}
              dataKey="value"
            >
              {completeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} votes`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Votes</p>
          <p className="text-2xl font-bold text-blue-600">{totalVotes}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-gray-500">{pendingVotes}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;

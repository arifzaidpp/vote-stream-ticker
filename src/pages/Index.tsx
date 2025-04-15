
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PartyCard from '@/components/PartyCard';
import NewsTicker from '@/components/NewsTicker';
import ResultsChart from '@/components/ResultsChart';

// Mock data for demonstration
const initialPartyData = [
  {
    partyName: 'Party A',
    color: 'blue',
    candidates: [
      { name: 'John Smith', position: 'President', votes: 342 },
      { name: 'Emily Johnson', position: 'Secretary', votes: 305 },
      { name: 'Michael Brown', position: 'Treasurer', votes: 289 },
    ]
  },
  {
    partyName: 'Party B',
    color: 'green',
    candidates: [
      { name: 'Sarah Williams', position: 'President', votes: 315 },
      { name: 'David Miller', position: 'Secretary', votes: 332 },
      { name: 'Jessica Davis', position: 'Treasurer', votes: 301 },
    ]
  },
  {
    partyName: 'Party C',
    color: 'orange',
    candidates: [
      { name: 'Robert Wilson', position: 'President', votes: 297 },
      { name: 'Lisa Martinez', position: 'Secretary', votes: 286 },
      { name: 'Daniel Taylor', position: 'Treasurer', votes: 310 },
    ]
  }
];

const newsMessages = [
  "Party B Secretary Candidate Now Leading with 332 Votes",
  "Third Round of Counting Shows Close Race for President Position",
  "Party A President Candidate Leading with 342 Votes So Far",
  "65% of Total Votes Counted, Results Expected by 9 PM",
  "Record Turnout Reported in This Year's DHIU Election",
];

const Index = () => {
  const [partyData, setPartyData] = useState(initialPartyData);
  const [totalVotes, setTotalVotes] = useState(0);
  const [pendingVotes, setPendingVotes] = useState(1000);
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string; }[]>([]);
  
  // Calculate total votes and update chart data
  useEffect(() => {
    let total = 0;
    const newChartData = partyData.map(party => {
      const partyTotal = party.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
      total += partyTotal;
      
      return {
        name: party.partyName,
        value: partyTotal,
        color: party.color === 'blue' ? '#2563eb' : 
               party.color === 'green' ? '#16a34a' : 
               '#f97316' // orange
      };
    });
    
    setTotalVotes(total);
    setChartData(newChartData);
  }, [partyData]);
  
  // Simulate live vote updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPartyData(prevData => {
        return prevData.map(party => {
          return {
            ...party,
            candidates: party.candidates.map(candidate => {
              // Random chance to update votes
              if (Math.random() > 0.7) {
                const increment = Math.floor(Math.random() * 5) + 1;
                return {
                  ...candidate,
                  votes: candidate.votes + increment
                };
              }
              return candidate;
            })
          };
        });
      });
      
      // Decrease pending votes
      setPendingVotes(prev => Math.max(0, prev - Math.floor(Math.random() * 10)));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Party Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {partyData.map((party, index) => (
              <PartyCard
                key={index}
                partyName={party.partyName}
                color={party.color}
                candidates={party.candidates}
              />
            ))}
          </div>
          
          {/* Side Panel with Charts */}
          <div className="lg:col-span-1">
            <ResultsChart 
              data={chartData} 
              totalVotes={totalVotes} 
              pendingVotes={pendingVotes} 
            />
          </div>
        </div>
      </main>
      
      {/* Breaking News Ticker */}
      <NewsTicker messages={newsMessages} />
    </div>
  );
};

export default Index;

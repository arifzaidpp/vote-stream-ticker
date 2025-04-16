import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PartyCard from '@/components/PartyCard';
import NewsTicker from '@/components/NewsTicker';
import CandidateComparison from '@/components/CandidateComparison';
import LeadingCandidates from '@/components/LeadingCandidates';
import VotingStats from '@/components/VotingStats';
import BoothView from '@/components/BoothView';
import Candidates from '@/components/Candidates';

// Mock data for demonstration
const booth1Data = [
  {
    partyName: 'Party A',
    color: 'blue',
    candidates: [
      { name: 'John Smith', position: 'President', votes: 142 },
      { name: 'Emily Johnson', position: 'Secretary', votes: 135 },
      { name: 'Michael Brown', position: 'Treasurer', votes: 129 },
    ]
  },
  {
    partyName: 'Party B',
    color: 'green',
    candidates: [
      { name: 'Sarah Williams', position: 'President', votes: 115 },
      { name: 'David Miller', position: 'Secretary', votes: 152 },
      { name: 'Jessica Davis', position: 'Treasurer', votes: 131 },
    ]
  },
  {
    partyName: 'Party C',
    color: 'orange',
    candidates: [
      { name: 'Robert Wilson', position: 'President', votes: 107 },
      { name: 'Lisa Martinez', position: 'Secretary', votes: 116 },
      { name: 'Daniel Taylor', position: 'Treasurer', votes: 140 },
    ]
  }
];

const booth2Data = [
  {
    partyName: 'Party A',
    color: 'blue',
    candidates: [
      { name: 'John Smith', position: 'President', votes: 200 },
      { name: 'Emily Johnson', position: 'Secretary', votes: 170 },
      { name: 'Michael Brown', position: 'Treasurer', votes: 160 },
    ]
  },
  {
    partyName: 'Party B',
    color: 'green',
    candidates: [
      { name: 'Sarah Williams', position: 'President', votes: 200 },
      { name: 'David Miller', position: 'Secretary', votes: 180 },
      { name: 'Jessica Davis', position: 'Treasurer', votes: 170 },
    ]
  },
  {
    partyName: 'Party C',
    color: 'orange',
    candidates: [
      { name: 'Robert Wilson', position: 'President', votes: 190 },
      { name: 'Lisa Martinez', position: 'Secretary', votes: 170 },
      { name: 'Daniel Taylor', position: 'Treasurer', votes: 170 },
    ]
  }
];

// Calculate total data
const calculateTotalData = () => {
  return [
    {
      partyName: 'Party A',
      color: 'blue',
      candidates: [
        { 
          name: 'John Smith', 
          position: 'President', 
          votes: booth1Data[0].candidates[0].votes + booth2Data[0].candidates[0].votes 
        },
        { 
          name: 'Emily Johnson', 
          position: 'Secretary', 
          votes: booth1Data[0].candidates[1].votes + booth2Data[0].candidates[1].votes 
        },
        { 
          name: 'Michael Brown', 
          position: 'Treasurer', 
          votes: booth1Data[0].candidates[2].votes + booth2Data[0].candidates[2].votes 
        },
      ]
    },
    {
      partyName: 'Party B',
      color: 'green',
      candidates: [
        { 
          name: 'Sarah Williams', 
          position: 'President', 
          votes: booth1Data[1].candidates[0].votes + booth2Data[1].candidates[0].votes 
        },
        { 
          name: 'David Miller', 
          position: 'Secretary', 
          votes: booth1Data[1].candidates[1].votes + booth2Data[1].candidates[1].votes 
        },
        { 
          name: 'Jessica Davis', 
          position: 'Treasurer', 
          votes: booth1Data[1].candidates[2].votes + booth2Data[1].candidates[2].votes 
        },
      ]
    },
    {
      partyName: 'Party C',
      color: 'orange',
      candidates: [
        { 
          name: 'Robert Wilson', 
          position: 'President', 
          votes: booth1Data[2].candidates[0].votes + booth2Data[2].candidates[0].votes 
        },
        { 
          name: 'Lisa Martinez', 
          position: 'Secretary', 
          votes: booth1Data[2].candidates[1].votes + booth2Data[2].candidates[1].votes 
        },
        { 
          name: 'Daniel Taylor', 
          position: 'Treasurer', 
          votes: booth1Data[2].candidates[2].votes + booth2Data[2].candidates[2].votes 
        },
      ]
    }
  ];
};

// Helper function to get leading candidates for a booth
const getLeadingCandidates = (boothData) => {
  // Get all president candidates
  const presidents = boothData.map(party => ({
    name: party.candidates[0].name,
    partyName: party.partyName,
    partyColor: party.color,
    votes: party.candidates[0].votes,
  }));
  
  // Get all secretary candidates
  const secretaries = boothData.map(party => ({
    name: party.candidates[1].name,
    partyName: party.partyName,
    partyColor: party.color,
    votes: party.candidates[1].votes,
  }));
  
  // Get all treasurer candidates
  const treasurers = boothData.map(party => ({
    name: party.candidates[2].name,
    partyName: party.partyName,
    partyColor: party.color,
    votes: party.candidates[2].votes,
  }));
  
  // Get leading candidates by sorting by votes
  const leadingPresident = [...presidents].sort((a, b) => b.votes - a.votes)[0];
  const leadingSecretary = [...secretaries].sort((a, b) => b.votes - a.votes)[0];
  const leadingTreasurer = [...treasurers].sort((a, b) => b.votes - a.votes)[0];
  
  return {
    president: leadingPresident,
    secretary: leadingSecretary,
    treasurer: leadingTreasurer,
  };
};

// Prepare candidate comparison data
const getCandidateComparison = (boothData) => {
  // Get all president candidates with rank
  const presidents = boothData.map(party => ({
    name: party.candidates[0].name,
    partyName: party.partyName,
    partyColor: party.color,
    votes: party.candidates[0].votes,
    rank: 0,
  })).sort((a, b) => b.votes - a.votes)
    .map((candidate, index) => ({...candidate, rank: index + 1}));
  
  // Get all secretary candidates with rank
  const secretaries = boothData.map(party => ({
    name: party.candidates[1].name,
    partyName: party.partyName,
    partyColor: party.color,
    votes: party.candidates[1].votes,
    rank: 0,
  })).sort((a, b) => b.votes - a.votes)
    .map((candidate, index) => ({...candidate, rank: index + 1}));
  
  // Get all treasurer candidates with rank
  const treasurers = boothData.map(party => ({
    name: party.candidates[2].name,
    partyName: party.partyName,
    partyColor: party.color,
    votes: party.candidates[2].votes,
    rank: 0,
  })).sort((a, b) => b.votes - a.votes)
    .map((candidate, index) => ({...candidate, rank: index + 1}));
  
  return {
    presidents,
    secretaries,
    treasurers
  };
};

const newsMessages = [
  "Party B Secretary Candidate Now Leading with 332 Votes",
  "Third Round of Counting Shows Close Race for President Position",
  "Party A President Candidate Leading with 342 Votes So Far",
  "65% of Total Votes Counted, Results Expected by 9 PM",
  "Record Turnout Reported in This Year's DHIU Election",
];

const Index = () => {
  const [totalData, setTotalData] = useState(calculateTotalData());
  const [totalVotes, setTotalVotes] = useState(0);
  const [pendingVotes, setPendingVotes] = useState(800);
  const [countingPercentage, setCountingPercentage] = useState(0);
  const [activeView, setActiveView] = useState<'booth1' | 'booth2' | 'total'>('booth1');
  
  // Calculate voting statistics
  useEffect(() => {
    // Calculate total votes across all booths
    let total = 0;
    
    booth1Data.forEach(party => {
      party.candidates.forEach(candidate => {
        total += candidate.votes;
      });
    });
    
    booth2Data.forEach(party => {
      party.candidates.forEach(candidate => {
        total += candidate.votes;
      });
    });
    
    setTotalVotes(total);
    
    // Calculate counting percentage
    const maxVotes = total + pendingVotes;
    const percentage = Math.round((total / maxVotes) * 100);
    setCountingPercentage(percentage);
    
    // Update total data
    setTotalData(calculateTotalData());
  }, [pendingVotes, booth1Data, booth2Data]);
  
  // Prepare candidate comparison data
  const candidateComparison = getCandidateComparison(totalData);
  
  // Simulate live vote updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Decrease pending votes
      setPendingVotes(prev => Math.max(0, prev - Math.floor(Math.random() * 10)));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Switch between views
  const handleViewSwitch = () => {
    setActiveView(current => {
      if (current === 'booth1') return 'booth2';
      if (current === 'booth2') return 'total';
      return 'booth1';
    });
  };
  
  // Calculate stats for active view
  const getActiveViewStats = () => {
    let totalVotesForView = 0;
    let data: any[] = [];
    
    if (activeView === 'booth1') {
      data = booth1Data;
      data.forEach(party => {
        party.candidates.forEach(candidate => {
          totalVotesForView += candidate.votes;
        });
      });
    } else if (activeView === 'booth2') {
      data = booth2Data;
      data.forEach(party => {
        party.candidates.forEach(candidate => {
          totalVotesForView += candidate.votes;
        });
      });
    } else {
      data = totalData;
      totalVotesForView = totalVotes;
    }
    
    return {
      totalVotes: totalVotesForView,
      pendingVotes: Math.round(pendingVotes / (activeView === 'total' ? 1 : 2)),
      countingPercentage: countingPercentage,
      data
    };
  };
  
  // Get active view title
  const getActiveViewTitle = () => {
    if (activeView === 'booth1') return 'Booth 1';
    if (activeView === 'booth2') return 'Booth 2';
    return 'Total Results';
  };
  
  const activeViewStats = getActiveViewStats();
  const leadingCandidates = 
    activeView === 'booth1' ? getLeadingCandidates(booth1Data) :
    activeView === 'booth2' ? getLeadingCandidates(booth2Data) :
    getLeadingCandidates(totalData);
  
  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-hidden p-3">
        <BoothView
          boothName={getActiveViewTitle()}
          partyData={activeViewStats.data}
          leadingCandidates={leadingCandidates}
          totalVotes={activeViewStats.totalVotes}
          pendingVotes={activeViewStats.pendingVotes}
          countingPercentage={activeViewStats.countingPercentage}
          onSwitch={handleViewSwitch}
          autoSwitchInterval={10000}
          candidateComparison={candidateComparison}
        />
      </main>
      
      {/* Breaking News Ticker */}
      <NewsTicker messages={newsMessages} />
    </div>
  );
};

export default Index;

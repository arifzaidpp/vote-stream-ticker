
import { useState, useEffect } from 'react';

// Types
interface Candidate {
  name: string;
  position: string;
  votes: number;
}

interface PartyData {
  partyName: string;
  color: string;
  candidates: Candidate[];
}

export const booth1Data: PartyData[] = [
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

export const booth2Data: PartyData[] = [
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

export const useElectionData = () => {
  const [totalVotes, setTotalVotes] = useState(0);
  const [pendingVotes, setPendingVotes] = useState(800);
  const [countingPercentage, setCountingPercentage] = useState(0);
  const [activeView, setActiveView] = useState<'booth1' | 'booth2' | 'total'>('booth1');
  const [totalData, setTotalData] = useState(calculateTotalData());

  // Calculate total data
  function calculateTotalData(): PartyData[] {
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
  }

  useEffect(() => {
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
    
    const maxVotes = total + pendingVotes;
    const percentage = Math.round((total / maxVotes) * 100);
    setCountingPercentage(percentage);
    
    setTotalData(calculateTotalData());
  }, [pendingVotes]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingVotes(prev => Math.max(0, prev - Math.floor(Math.random() * 10)));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleViewSwitch = () => {
    setActiveView(current => {
      if (current === 'booth1') return 'booth2';
      if (current === 'booth2') return 'total';
      return 'booth1';
    });
  };

  return {
    totalVotes,
    pendingVotes,
    countingPercentage,
    activeView,
    totalData,
    handleViewSwitch
  };
};

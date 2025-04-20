import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Header from '@/components/Header';
import PartyCard from '@/components/PartyCard';
import NewsTicker from '@/components/NewsTicker';
import CandidateComparison from '@/components/LeadingCandidates';
import LeadingCandidates from '@/components/LeadingParties';
import VotingStats from '@/components/VotingStats';
import BoothView from '@/components/BoothView';
import Candidates from '@/components/Candidates';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { id: accessCode } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [electionData, setElectionData] = useState(null);
  const [boothData, setBoothData] = useState({});
  const [totalData, setTotalData] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [pendingVotes, setPendingVotes] = useState(0);
  const [countingPercentage, setCountingPercentage] = useState(0);
  const [activeView, setActiveView] = useState('total');
  const [newsMessages, setNewsMessages] = useState([
    "Counting in progress - Stay tuned for results",
    "Live updates every minute - Refresh for latest counts"
  ]);
  
  // Initialize socket connection
  useEffect(() => {
    if (!accessCode || accessCode.trim() === '') {
      console.error('No access code provided');
      toast({
      title: 'Access Code Missing',
      description: 'Please provide a valid access code to proceed.',
      variant: 'destructive',
      });
      // navigate('/'); // Redirect to home page if accessCode is missing
      return;
    }

    // Get token from localStorage
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   navigate('/login');
    //   return;
    // }

    // Initialize socket with auth token
    const socketInstance = io(import.meta.env.VITE_GRAPHQL_API_URL, {
      // auth: {
      //   token
      // }
    });

    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
      
      // Join election room with accessCode
      socketInstance.emit('joinElectionRoom', { electionId: accessCode });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
      toast({
        title: 'Connection Error',
        description: `Failed to connect to server: ${err.message || 'Unknown error'}.`,
        variant: 'destructive',
      });
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [accessCode, navigate]);

  // Handle initial election data
  useEffect(() => {
    if (socket) {
      socket.on('electionData', (data) => {
        console.log('Received election data:', data);
        setElectionData(data.election);
        
        // Process booth data
        const booths = {};
        data.booths.forEach(booth => {
          booths[booth.id] = {
            id: booth.id,
            name: booth.name,
            status: booth.status,
            data: processBoothResults(booth.results)
          };
        });
        
        setBoothData(booths);
        
        // Generate news messages
        generateNewsMessages(data);
        
        // Calculate total data across all booths
        calculateTotalData(booths);
      });
    }
  }, [socket]);

  // Handle real-time vote count updates
  useEffect(() => {
    if (socket) {
      socket.on('voteCountUpdated', (data) => {
        console.log('Vote count updated:', data);
        
        // Update specific booth data
        setBoothData(prevBoothData => {
          const updatedBoothData = { ...prevBoothData };
          
          if (updatedBoothData[data.boothId]) {
            updatedBoothData[data.boothId] = {
              ...updatedBoothData[data.boothId],
              data: processBoothResults(data.results)
            };
          }
          
          return updatedBoothData;
        });
        
        // Add news message
        const boothName = boothData[data.boothId]?.name || `Booth ${data.boothId}`;
        addNewsMessage(`New votes counted at ${boothName} - Updated at ${new Date().toLocaleTimeString()}`);
      });

      socket.on('roundPublished', (data) => {
        console.log('Round published:', data);
        addNewsMessage(`New counting round published - Round ${data.roundId}`);
      });

      socket.on('boothCountingStarted', (data) => {
        console.log('Booth counting started:', data);
        const boothName = boothData[data.boothId]?.name || `Booth ${data.boothId}`;
        addNewsMessage(`Counting started at ${boothName}`);
      });

      socket.on('boothCountingCompleted', (data) => {
        console.log('Booth counting completed:', data);
        const boothName = boothData[data.boothId]?.name || `Booth ${data.boothId}`;
        addNewsMessage(`Counting completed at ${boothName}`);
      });

      socket.on('countingError', (error) => {
        console.error('Counting error:', error);
        toast({
          title: 'Counting Error',
          description: error.message || 'An error occurred during vote counting',
          variant: 'destructive',
        });
      });
    }
  }, [socket, boothData]);

  // Calculate total data whenever booth data changes
  useEffect(() => {
    calculateTotalData(boothData);
  }, [boothData]);

  // Process booth results into our party-candidate structure
  const processBoothResults = (results) => {
    if (!results || !Array.isArray(results)) return [];
    
    // Group by party
    const parties = {};
    
    results.forEach(result => {
      const partyId = result.party.id;
      const candidateName = result.candidate.name;
      const position = result.candidate.position;
      const votes = result.votes;
      
      if (!parties[partyId]) {
        parties[partyId] = {
          partyId,
          partyName: result.party.name,
          color: result.party.color || getPartyColor(result.party.name),
          logo: result.party.logo,
          candidates: []
        };
      }
      
      // Add or update candidate
      const existingCandidate = parties[partyId].candidates.find(c => c.name === candidateName);
      if (existingCandidate) {
        existingCandidate.votes = votes;
      } else {
        parties[partyId].candidates.push({
          name: candidateName,
          position,
          votes
        });
      }
    });
    
    // Convert to array
    return Object.values(parties);
  };

  // Calculate total data across all booths
  const calculateTotalData = (booths) => {
    const parties = {};
    let totalVoteCount = 0;
    
    // Process each booth's data
    Object.values(booths).forEach(booth => {
      if (!booth || typeof booth !== 'object' || !('data' in booth)) return;
      
      (Array.isArray(booth.data) ? booth.data : []).forEach(party => {
        const partyId = party.partyId;
        
        if (!parties[partyId]) {
          parties[partyId] = {
            ...party,
            candidates: party.candidates.map(candidate => ({
              ...candidate,
              votes: 0
            }))
          };
        }
        
        // Sum up votes for each candidate
        party.candidates.forEach(candidate => {
          const existingCandidate = parties[partyId].candidates.find(c => 
            c.name === candidate.name && c.position === candidate.position
          );
          
          if (existingCandidate) {
            existingCandidate.votes += candidate.votes;
          }
          
          totalVoteCount += candidate.votes;
        });
      });
    });
    
    setTotalData(Object.values(parties));
    setTotalVotes(totalVoteCount);
    
    // Calculate counting percentage and pending votes (if we have total expected votes from election data)
    if (electionData && electionData.totalExpectedVotes) {
      const expectedVotes = electionData.totalExpectedVotes;
      setPendingVotes(Math.max(0, expectedVotes - totalVoteCount));
      setCountingPercentage(Math.round((totalVoteCount / expectedVotes) * 100));
    } else {
      // Fallback if no expected votes data
      setPendingVotes(0);
      setCountingPercentage(100);
    }
  };

  // Add a new news message
  const addNewsMessage = (message) => {
    setNewsMessages(prev => {
      const newMessages = [message, ...prev.slice(0, 4)]; // Keep only latest 5 messages
      return newMessages;
    });
  };

  // Generate initial news messages from election data
  const generateNewsMessages = (data) => {
    const messages = [];
    
    if (data.election) {
      messages.push(`Welcome to ${data.election.name} live results`);
    }
    
    if (data.booths && data.booths.length > 0) {
      const countingBooths = data.booths.filter(booth => booth.status === 'COUNTING');
      const completedBooths = data.booths.filter(booth => booth.status === 'COMPLETED');
      
      if (countingBooths.length > 0) {
        messages.push(`Counting in progress at ${countingBooths.length} booth(s)`);
      }
      
      if (completedBooths.length > 0) {
        messages.push(`${completedBooths.length} booth(s) completed counting`);
      }
    }
    
    if (messages.length > 0) {
      setNewsMessages(prev => [...messages, ...prev].slice(0, 5));
    }
  };

  // Assign a color based on party name
  const getPartyColor = (partyName) => {
    const colors = ['blue', 'green', 'orange', 'purple', 'red', 'teal'];
    let hash = 0;
    
    for (let i = 0; i < partyName.length; i++) {
      hash = partyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Helper function to get leading candidates for current view
  const getLeadingCandidates = () => {
    let data = [];
    
    if (activeView === 'total') {
      data = totalData;
    } else {
      const boothId = activeView;
      data = boothData[boothId]?.data || [];
    }
    
    if (!data || data.length === 0) {
      return {
        president: { name: 'N/A', partyName: 'N/A', partyColor: 'gray', votes: 0 },
        secretary: { name: 'N/A', partyName: 'N/A', partyColor: 'gray', votes: 0 },
        treasurer: { name: 'N/A', partyName: 'N/A', partyColor: 'gray', votes: 0 }
      };
    }
    
    // Get all president candidates
    const presidents = data.flatMap(party => 
      party.candidates
        .filter(c => c.position === 'President')
        .map(c => ({
          name: c.name,
          partyName: party.partyName,
          partyColor: party.color,
          votes: c.votes,
        }))
    );
    
    // Get all secretary candidates
    const secretaries = data.flatMap(party => 
      party.candidates
        .filter(c => c.position === 'Secretary')
        .map(c => ({
          name: c.name,
          partyName: party.partyName,
          partyColor: party.color,
          votes: c.votes,
        }))
    );
    
    // Get all treasurer candidates
    const treasurers = data.flatMap(party => 
      party.candidates
        .filter(c => c.position === 'Treasurer')
        .map(c => ({
          name: c.name,
          partyName: party.partyName,
          partyColor: party.color,
          votes: c.votes,
        }))
    );
    
    // Get leading candidates by sorting by votes
    const leadingPresident = presidents.length > 0 ? 
      [...presidents].sort((a, b) => b.votes - a.votes)[0] : 
      { name: 'N/A', partyName: 'N/A', partyColor: 'gray', votes: 0 };
      
    const leadingSecretary = secretaries.length > 0 ? 
      [...secretaries].sort((a, b) => b.votes - a.votes)[0] : 
      { name: 'N/A', partyName: 'N/A', partyColor: 'gray', votes: 0 };
      
    const leadingTreasurer = treasurers.length > 0 ? 
      [...treasurers].sort((a, b) => b.votes - a.votes)[0] : 
      { name: 'N/A', partyName: 'N/A', partyColor: 'gray', votes: 0 };
    
    return {
      president: leadingPresident,
      secretary: leadingSecretary,
      treasurer: leadingTreasurer,
    };
  };

  // Prepare candidate comparison data for current view
  const getCandidateComparison = () => {
    let data = [];
    
    if (activeView === 'total') {
      data = totalData;
    } else {
      const boothId = activeView;
      data = boothData[boothId]?.data || [];
    }
    
    if (!data || data.length === 0) {
      return {
        presidents: [],
        secretaries: [],
        treasurers: []
      };
    }
    
    // Get all president candidates with rank
    const presidents = data.flatMap(party => 
      party.candidates
        .filter(c => c.position === 'President')
        .map(c => ({
          name: c.name,
          partyName: party.partyName,
          partyColor: party.color,
          votes: c.votes,
          rank: 0,
        }))
    ).sort((a, b) => b.votes - a.votes)
      .map((candidate, index) => ({...candidate, rank: index + 1}));
    
    // Get all secretary candidates with rank
    const secretaries = data.flatMap(party => 
      party.candidates
        .filter(c => c.position === 'Secretary')
        .map(c => ({
          name: c.name,
          partyName: party.partyName,
          partyColor: party.color,
          votes: c.votes,
          rank: 0,
        }))
    ).sort((a, b) => b.votes - a.votes)
      .map((candidate, index) => ({...candidate, rank: index + 1}));
    
    // Get all treasurer candidates with rank
    const treasurers = data.flatMap(party => 
      party.candidates
        .filter(c => c.position === 'Treasurer')
        .map(c => ({
          name: c.name,
          partyName: party.partyName,
          partyColor: party.color,
          votes: c.votes,
          rank: 0,
        }))
    ).sort((a, b) => b.votes - a.votes)
      .map((candidate, index) => ({...candidate, rank: index + 1}));
    
    return {
      presidents,
      secretaries,
      treasurers
    };
  };

  // Switch between views (total or specific booth)
  const handleViewSwitch = () => {
    // Get all booth IDs
    const boothIds = Object.keys(boothData);
    
    if (boothIds.length === 0) {
      setActiveView('total');
      return;
    }
    
    // Find current index
    let currentIndex = -1;
    if (activeView === 'total') {
      currentIndex = -1;
    } else {
      currentIndex = boothIds.indexOf(activeView);
    }
    
    // Move to next view
    const nextIndex = (currentIndex + 1) % (boothIds.length + 1);
    
    if (nextIndex === boothIds.length) {
      setActiveView('total');
    } else {
      setActiveView(boothIds[nextIndex]);
    }
  };

  // Get active view stats
  const getActiveViewStats = () => {
    let viewTotalVotes = 0;
    let viewPendingVotes = 0;
    let viewCountingPercentage = 0;
    let viewData = [];
    let viewName = 'Total Results';
    
    if (activeView === 'total') {
      viewData = totalData;
      viewTotalVotes = totalVotes;
      viewPendingVotes = pendingVotes;
      viewCountingPercentage = countingPercentage;
    } else {
      const boothId = activeView;
      const booth = boothData[boothId];
      
      if (booth) {
        viewData = booth.data || [];
        viewName = booth.name || `Booth ${boothId}`;
        
        // Calculate booth-specific stats
        viewTotalVotes = booth.data?.reduce((sum, party) => 
          sum + party.candidates.reduce((sum, candidate) => sum + candidate.votes, 0), 0) || 0;
          
        // If we have expected votes per booth
        if (booth.expectedVotes) {
          viewPendingVotes = Math.max(0, booth.expectedVotes - viewTotalVotes);
          viewCountingPercentage = booth.expectedVotes > 0 ? 
            Math.round((viewTotalVotes / booth.expectedVotes) * 100) : 100;
        } else {
          // Fallback to overall stats
          viewPendingVotes = booth.status === 'COMPLETED' ? 0 : Math.floor(pendingVotes / Object.keys(boothData).length);
          viewCountingPercentage = booth.status === 'COMPLETED' ? 100 : countingPercentage;
        }
      }
    }
    
    return {
      boothName: viewName,
      data: viewData,
      totalVotes: viewTotalVotes,
      pendingVotes: viewPendingVotes,
      countingPercentage: viewCountingPercentage
    };
  };

  // Get data for current view
  const activeViewStats = getActiveViewStats();
  const leadingCandidates = getLeadingCandidates();
  const candidateComparison = getCandidateComparison();

  if (!isConnected) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Connecting to Election Server</h2>
            <p className="text-gray-600">Please wait while we establish a connection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!electionData) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Loading Election Data</h2>
            <p className="text-gray-600">Fetching the latest election results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      <Header electionName={electionData.name} />
      
      <main className="flex-1 overflow-hidden p-3">
        <BoothView
          boothName={activeViewStats.boothName}
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
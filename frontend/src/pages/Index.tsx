import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import BoothView from '@/components/BoothView';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { id: electionId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [electionData, setElectionData] = useState(null);
  interface Booth {
    id: string;
    name: string;
    boothNumber: number;
    status: 'PENDING' | 'COUNTING' | 'COMPLETED';
    data: any[];
    expectedVotes: number;
    totalVotesCounted: number;
  }

  const [boothData, setBoothData] = useState<Record<string, Booth>>({});
  const [totalData, setTotalData] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [pendingVotes, setPendingVotes] = useState(0);
  const [notaData, setNotaData] = useState(null);
  const [countingPercentage, setCountingPercentage] = useState(0);
  const [activeView, setActiveView] = useState('total');
  const [newsMessages, setNewsMessages] = useState([
    "Counting in progress - Stay tuned for results",
    "Live updates every minute - Refresh for latest counts"
  ]);

  // Initialize socket connection
  useEffect(() => {
    if (!electionId || electionId.trim() === '') {
      toast({
        title: 'Access Code Missing',
        description: 'Please provide a valid access code to proceed.',
        variant: 'destructive',
      });
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initialize socket with auth token
    const apiUrl = import.meta.env.VITE_API_URL || 'https://vote-stream-ticker.onrender.com';
    const socketInstance = io(apiUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Socket event handlers
    socketInstance.on('connect', () => {
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Real-time counting connection established",
      });

      // Join election room when connected
      if (electionId) {
        socketInstance.emit('joinElectionRoom', { electionId });
      }
    });

    setSocket(socketInstance);

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
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
  }, [electionId, navigate]);

  // Process candidate results from round data
  const processRoundData = (roundData) => {
    if (!roundData || !roundData.data || !Array.isArray(roundData.data)) {
      return [];
    }

    return roundData.data.map(candidate => ({
      candidateId: candidate.id,
      name: candidate.name,
      partyId: candidate.partyId,
      position: candidate.position,
      photo: candidate.photo,
      voteCount: candidate.votes || 0
    }));
  };

  // Handle initial election data
  useEffect(() => {
    if (socket) {
      socket.on('electionData', (data) => {
        // Store the entire election data
        setElectionData(data);

        console.log('Election data received:', data);


        // Initialize booth data
        const booths = {};

        if (data.booths && Array.isArray(data.booths)) {
          // Create a mapping of parties for quicker reference
          const partyMap = {};
          if (data.parties && Array.isArray(data.parties)) {
            data.parties.forEach(party => {
              partyMap[party.id] = party;
            });
          }

          // Process each booth
          data.booths.forEach(booth => {
            // Only include booths that are counting or completed
            if (booth.status === 'PENDING') return;

            const boothId = booth.id;
            const boothNumber = booth.boothNumber || 0;

            // Find the latest counting round
            let latestRound = null;
            let latestRoundNumber = -1;

            if (booth.countingRounds && Array.isArray(booth.countingRounds)) {
              booth.countingRounds.forEach(round => {
                if (round.roundNumber > latestRoundNumber) {
                  latestRound = round;
                  latestRoundNumber = round.roundNumber;
                }
              });
            }

            // Initialize party data structure for this booth
            const boothPartyData = [];

            // Add party and candidate data
            if (data.parties && Array.isArray(data.parties)) {
              data.parties.forEach(party => {
                if (["NOTA", "Nota", "nota"].includes(party.name)) {
                  // Save NOTA party data separately
                  const notaPartyData = {
                    partyId: party.id,
                    partyName: party.name,
                    color: party.color,
                    logo: party.logo,
                    candidates: party.candidates?.map(candidate => {
                      // Find votes for this candidate in the latest round
                      let votes = 0;

                      if (latestRound && latestRound.results) {
                        const resultEntry = latestRound.results.find(r => r.candidateId === candidate.id);
                        if (resultEntry) {
                          votes = resultEntry.voteCount || 0;
                        }
                      }

                      // Create candidate object with booth-specific votes
                      return {
                        id: candidate.id,
                        name: candidate.name,
                        position: candidate.position,
                        photo: candidate.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`,
                        votes: votes,
                        booth1Votes: boothNumber === 1 ? votes : 0,
                        booth2Votes: boothNumber === 2 ? votes : 0
                      };
                    }) || []
                  };

                  // Update NOTA data in state
                  setNotaData(notaPartyData);
                } else {
                  const partyData = {
                    partyId: party.id,
                    partyName: party.name,
                    color: party.color,
                    logo: party.logo,
                    candidates: []
                  };

                  // Add candidates with their vote counts
                  if (party.candidates && Array.isArray(party.candidates)) {
                    partyData.candidates = party.candidates.map(candidate => {
                      // Find votes for this candidate in the latest round
                      let votes = 0;

                      if (latestRound && latestRound.results) {
                        const resultEntry = latestRound.results.find(r => r.candidateId === candidate.id);
                        if (resultEntry) {
                          votes = resultEntry.voteCount || 0;
                        }
                      }

                      // Create candidate object with booth-specific votes
                      return {
                        id: candidate.id,
                        name: candidate.name,
                        position: candidate.position,
                        photo: candidate.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`,
                        votes: votes,
                        percentage: electionData && electionData.totalVoters ? ((votes / electionData.totalVoters) * 100).toFixed(2) : 0,
                      };
                    });
                  }

                  boothPartyData.push(partyData);
                }
              });
            }

            // Calculate total votes for this booth
            let boothTotalVotes = 0;
            if (latestRound && latestRound.results) {
              boothTotalVotes = latestRound.results.reduce((sum, r) => sum + (r.voteCount || 0), 0);
            }

            // Store booth data
            booths[boothId] = {
              id: boothId,
              name: `Booth ${boothNumber}`,
              boothNumber: boothNumber,
              status: booth.status,
              data: boothPartyData,
              totalVotesCounted: boothTotalVotes
            };

            const activeBooths = Object.values(booths).filter((b: Booth) => b.status === 'COUNTING' || b.status === 'COMPLETED');
          });
        }

        setBoothData(booths);

        // Generate news messages
        addNewsMessage(`Welcome to ${data.name} live results`);
        const activeBooths = Object.values(booths).filter((b) => (b as Booth).status === 'COUNTING' || (b as Booth).status === 'COMPLETED');
        addNewsMessage(`${activeBooths.length} booth(s) actively reporting results`);

        // Calculate initial total data
        calculateTotalData(Object.values(booths));
      });
    }
  }, [socket]);

  // Handle real-time updates
  useEffect(() => {
    if (socket && electionData) {
      // Handle round published event
      socket.on('roundPublished', (data) => {
        if (!data) return;

        console.log('Round published:', data);

        // Find which booth this belongs to
        let targetBoothId = null;
        let targetBoothNumber = 0;

        if (data.boothId) {
          // If booth ID is directly provided
          targetBoothId = data.boothId;
          targetBoothNumber = boothData[data.boothId]?.boothNumber || 0;
        } else if (data.roundId && electionData.booths) {
          // Otherwise try to find the booth by round ID
          for (const booth of electionData.booths) {
            if (booth.countingRounds && booth.countingRounds.some(r => r.id === data.roundId)) {
              targetBoothId = booth.id;
              targetBoothNumber = booth.boothNumber || 0;
              break;
            }
          }
        }

        // If we couldn't identify a booth, use the first active booth as fallback
        if (!targetBoothId) {
          const activeBooths = Object.keys(boothData).filter(id =>
            boothData[id].status === 'COUNTING' || boothData[id].status === 'COMPLETED'
          );
          if (activeBooths.length > 0) {
            targetBoothId = activeBooths[0];
            targetBoothNumber = boothData[targetBoothId].boothNumber || 0;
          } else {
            return; // Can't process without a target booth
          }
        }

        // Process results from data
        let candidateResults = [];
        if (data.data && Array.isArray(data.data)) {
          candidateResults = processRoundData(data);
        } else if (data.roundId && electionData.booths) {
          // Try to find round data in election data
          for (const booth of electionData.booths) {
            if (booth.countingRounds) {
              const round = booth.countingRounds.find(r => r.id === data.roundId);
              if (round && round.results) {
                candidateResults = round.results;
                break;
              }
            }
          }
        }

        if (candidateResults.length === 0) return;

        // Calculate total votes for this round
        const roundTotalVotes = candidateResults.reduce((sum, result) =>
          sum + (result.voteCount || 0), 0);

        // Update booth data with new results
        setBoothData(prev => {
          const updated = { ...prev };

          if (updated[targetBoothId]) {
            // Update each candidate's votes in the booth data
            const updatedPartyData = [...updated[targetBoothId].data];

            updatedPartyData.forEach(party => {
              if (party.candidates && Array.isArray(party.candidates)) {
                party.candidates.forEach(candidate => {
                  // Find this candidate in the results
                  const resultEntry = candidateResults.find(r =>
                    r.candidateId === candidate.id || r.id === candidate.id
                  );

                  if (resultEntry) {
                    const votes = resultEntry.voteCount || 0;
                    candidate.votes = votes;

                    // Add percentage calculation here
                    candidate.percentage = electionData && electionData.totalVoters
                      ? ((votes / electionData.totalVoters) * 100).toFixed(2)
                      : 0;

                    // Update booth-specific votes
                    if (targetBoothNumber === 1) {
                      candidate.booth1Votes = votes;
                    } else if (targetBoothNumber === 2) {
                      candidate.booth2Votes = votes;
                    }
                  }
                });
              }
            });

            // Update the booth with new data
            updated[targetBoothId] = {
              ...updated[targetBoothId],
              data: updatedPartyData,
              totalVotesCounted: roundTotalVotes
            };
          }

          return updated;
        });

        // Add NOTA update logic here - this is the key fix
        setNotaData(prevNotaData => {
          if (!prevNotaData) return prevNotaData;

          const updatedNotaCandidates = prevNotaData.candidates.map(candidate => {
            // Find this NOTA candidate in the results
            const resultEntry = candidateResults.find(r =>
              r.candidateId === candidate.id || r.id === candidate.id
            );

            if (resultEntry) {
              const votes = resultEntry.voteCount || 0;

              // Update booth-specific votes for NOTA
              return {
                ...candidate,
                votes: votes,
                percentage: electionData && electionData.totalVoters
                  ? ((votes / electionData.totalVoters) * 100).toFixed(2)
                  : 0,
              };
            }

            return candidate;
          });

          // Return updated NOTA data
          return {
            ...prevNotaData,
            candidates: updatedNotaCandidates
          };
        });

        // Add news message
        const roundRef = data.roundNumber || (data.roundId && data.roundId.substring(0, 5)) || "new";
        addNewsMessage(`New results from Booth ${targetBoothNumber} - Round ${roundRef}`);

        // Force update of total data
        setTimeout(() => calculateTotalData(Object.values(boothData)), 100);
      });

      // Handle booth status changes
      socket.on('boothCountingStarted', (data) => {
        if (data.boothId) {
          const boothNumber = boothData[data.boothId]?.boothNumber || 0;

          // Update booth status
          setBoothData(prev => {
            const updated = { ...prev };
            if (updated[data.boothId]) {
              updated[data.boothId] = {
                ...updated[data.boothId],
                status: 'COUNTING'
              };
            }
            return updated;
          });

          addNewsMessage(`Counting started at Booth ${boothNumber}`);
        }
      });

      socket.on('boothCountingCompleted', (data) => {
        if (data.boothId) {
          const boothNumber = boothData[data.boothId]?.boothNumber || 0;

          // Update booth status
          setBoothData(prev => {
            const updated = { ...prev };
            if (updated[data.boothId]) {
              updated[data.boothId] = {
                ...updated[data.boothId],
                status: 'COMPLETED'
              };
            }
            return updated;
          });

          addNewsMessage(`Counting completed at Booth ${boothNumber}`);
        }
      });

      // Handle counting errors
      socket.on('countingError', (error) => {
        toast({
          title: 'Counting Error',
          description: error.message || 'An error occurred during vote counting',
          variant: 'destructive',
        });
      });

      return () => {
        socket.off('roundPublished');
        socket.off('boothCountingStarted');
        socket.off('boothCountingCompleted');
        socket.off('countingError');
      };
    }
  }, [socket, electionData, boothData]);

  // Calculate total data across all booths
  const calculateTotalData = (booths) => {
    // Only include non-pending booths
    const activeBooths = booths.filter(booth =>
      booth && (booth.status === 'COUNTING' || booth.status === 'COMPLETED')
    );

    // Store party data with aggregated votes
    const partyMap = {};
    let totalVoteCount = 0;

    // Process each active booth
    activeBooths.forEach(booth => {
      if (!booth || !Array.isArray(booth.data)) return;

      booth.data.forEach(party => {
        const partyId = party.partyId;

        // Initialize party entry if needed
        if (!partyMap[partyId]) {
          partyMap[partyId] = {
            ...party,
            candidates: party.candidates?.map(c => ({
              ...c,
              votes: 0,
              booth1Votes: 0,
              booth2Votes: 0
            })) || []
          };
        }

        // Sum up votes for each candidate
        // In the calculateTotalData function
        if (party.candidates && Array.isArray(party.candidates)) {
          party.candidates.forEach(candidate => {
            // Find matching candidate in our aggregated data
            const targetCandidate = partyMap[partyId].candidates.find(c => c.id === candidate.id);

            if (targetCandidate) {
              // Add this candidate's votes to the total
              targetCandidate.votes += candidate.votes || 0;
              targetCandidate.booth1Votes += candidate.booth1Votes || 0;
              targetCandidate.booth2Votes += candidate.booth2Votes || 0;

              // Add to total vote count
              totalVoteCount += candidate.votes || 0;
            }
          });
        }

        // After summing up all votes, calculate percentages based on new totals
        Object.values(partyMap).forEach((party: any) => {
          if (party.candidates && Array.isArray(party.candidates)) {
            party.candidates.forEach((candidate: any) => {
              // Calculate percentage based on total votes or total voters if available
              candidate.percentage = electionData && electionData.totalVoters
                ? ((candidate.votes / electionData.totalVoters) * 100).toFixed(2)
                : '0';
            });
          }
        });
      });
    });

    // Update state with calculated values
    setTotalData(Object.values(partyMap));
    setTotalVotes(totalVoteCount);

    // Calculate counting percentage and pending votes
    if (electionData && electionData.totalVoters) {
      const expectedVotes = electionData.totalVoters;
      setPendingVotes(Math.max(0, expectedVotes - totalVoteCount));
      setCountingPercentage(Math.round((totalVoteCount / expectedVotes) * 100));
    }
  };

  // Add a new news message
  const addNewsMessage = (message) => {
    setNewsMessages(prev => {
      const newMessages = [message, ...prev.slice(0, 4)]; // Keep only latest 5 messages
      return newMessages;
    });
  };

  // Get information about leading candidates for current view
  const getLeadingCandidates = () => {
    let data = [];

    if (activeView === 'total') {
      data = totalData;
    } else {
      data = boothData[activeView]?.data || [];
    }

    // Default candidate when no data is available
    const defaultCandidate = {
      name: 'N/A',
      partyName: 'N/A',
      partyColor: 'gray',
      votes: 0,
      booth1Votes: 0,
      booth2Votes: 0,
      photo: ''
    };

    // Extract all candidates by position
    const getAllCandidatesByPosition = (position) => {
      return data.flatMap(party =>
        (party.candidates || [])
          .filter(c => c.position === position)
          .map(c => ({
            name: c.name,
            partyName: party.partyName,
            partyColor: party.color,
            votes: c.votes || 0,
            booth1Votes: c.booth1Votes || 0,
            booth2Votes: c.booth2Votes || 0,
            photo: c.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`
          }))
      );
    };

    // Get candidates by position
    const presidents = getAllCandidatesByPosition('PRESIDENT');
    const secretaries = getAllCandidatesByPosition('SECRETARY');
    const treasurers = getAllCandidatesByPosition('TREASURER');

    // Get leading candidate for each position
    const leadingPresident = presidents.length > 0 ?
      [...presidents].sort((a, b) => b.votes - a.votes)[0] : defaultCandidate;

    const leadingSecretary = secretaries.length > 0 ?
      [...secretaries].sort((a, b) => b.votes - a.votes)[0] : defaultCandidate;

    const leadingTreasurer = treasurers.length > 0 ?
      [...treasurers].sort((a, b) => b.votes - a.votes)[0] : defaultCandidate;

    return {
      president: leadingPresident,
      secretary: leadingSecretary,
      treasurer: leadingTreasurer,
    };
  };

  // Get candidate comparison data for current view
  const getCandidateComparison = () => {
    let data = [];

    if (activeView === 'total') {
      data = totalData;
    } else {
      data = boothData[activeView]?.data || [];
    }

    if (!data || data.length === 0) {
      return {
        presidents: [],
        secretaries: [],
        treasurers: []
      };
    }

    // Process candidates for a position
    // In processPositionCandidates function
    const processPositionCandidates = (position) => {
      const candidates = data.flatMap(party =>
        (party.candidates || [])
          .filter(c => c.position === position)
          .map(c => ({
            name: c.name,
            partyName: party.partyName,
            partyColor: party.color,
            partyId: party.partyId,
            votes: c.votes || 0,
            percentage: c.percentage || 0, // Make sure to include the percentage
            booth1Votes: c.booth1Votes || 0,
            booth2Votes: c.booth2Votes || 0,
            photo: c.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`,
            rank: 0,
          }))
      );

      // Sort and assign rank
      return candidates
        .sort((a, b) => b.votes - a.votes)
        .map((candidate, index) => ({
          ...candidate,
          rank: index + 1,
          isLeading: index === 0 && candidate.votes > 0
        }));
    };

    return {
      presidents: processPositionCandidates('PRESIDENT'),
      secretaries: processPositionCandidates('SECRETARY'),
      treasurers: processPositionCandidates('TREASURER')
    };
  };

  // Switch between views (total or specific booth)
  const handleViewSwitch = () => {
    // Get active booth IDs (only COUNTING or COMPLETED)
    const activeBoothIds = Object.keys(boothData).filter(id =>
      boothData[id].status === 'COUNTING' || boothData[id].status === 'COMPLETED'
    );

    if (activeBoothIds.length === 0) {
      setActiveView('total');
      return;
    }

    // Find current index
    let currentIndex = -1;
    if (activeView === 'total') {
      currentIndex = -1;
    } else {
      currentIndex = activeBoothIds.indexOf(activeView);
    }

    // Move to next view
    const nextIndex = (currentIndex + 1) % (activeBoothIds.length + 1);

    if (nextIndex === activeBoothIds.length) {
      setActiveView('total');
    } else {
      setActiveView(activeBoothIds[nextIndex]);
    }
  };

  // Get statistics for the active view
  const getActiveViewStats = () => {
    let viewTotalVotes = 0;
    let viewPendingVotes = 0;
    let viewCountingPercentage = 0;
    let viewData = [];
    let viewName = 'Total';
    let boothNumber = null;

    if (activeView === 'total') {
      viewData = totalData;
      viewTotalVotes = totalVotes || 0;
      viewPendingVotes = pendingVotes || 0;
      viewCountingPercentage = countingPercentage || 0;
    } else {
      const boothId = activeView;
      const booth = boothData[boothId];

      if (booth) {
        viewData = booth.data || [];
        viewName = booth.name || `Booth ${boothId}`;
        boothNumber = booth.boothNumber || null;

        // Calculate booth-specific stats
        viewTotalVotes = booth.totalVotesCounted || 0;

        // If we have expected votes per booth
        if (booth.expectedVotes) {
          viewPendingVotes = Math.max(0, booth.expectedVotes - viewTotalVotes);
          viewCountingPercentage = booth.expectedVotes > 0 ?
            Math.round((viewTotalVotes / booth.expectedVotes) * 100) : 0;
        } else {
          // Fallback to overall stats
          viewPendingVotes = booth.status === 'COMPLETED' ? 0 : pendingVotes;
          viewCountingPercentage = booth.status === 'COMPLETED' ? 100 : countingPercentage;
        }
      }
    }

    return {
      boothName: viewName,
      boothNumber: boothNumber,
      data: viewData,
      totalVotes: viewTotalVotes,
      pendingVotes: viewPendingVotes,
      countingPercentage: viewCountingPercentage
    };
  };

  // Get all data for current view
  const activeViewStats = getActiveViewStats();
  const leadingCandidates = getLeadingCandidates();
  const candidateComparison = getCandidateComparison();

  // Loading state
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
      <Header electionName={electionData.name} electionImg={electionData.logo} />

      <main className="flex-1 overflow-hidden p-3">
        <BoothView
          boothName={activeViewStats.boothName}
          boothNumber={activeViewStats.boothNumber}
          partyData={activeViewStats.data}
          leadingCandidates={leadingCandidates}
          totalVotes={activeViewStats.totalVotes}
          pendingVotes={activeViewStats.pendingVotes}
          countingPercentage={activeViewStats.countingPercentage}
          notaData={notaData}
          onSwitch={handleViewSwitch}
          autoSwitchInterval={10000}
          candidateComparison={candidateComparison}
        />
      </main>

      <NewsTicker messages={newsMessages} />
    </div>
  );
};

export default Index;
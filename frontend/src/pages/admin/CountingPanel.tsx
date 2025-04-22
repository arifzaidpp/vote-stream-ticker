import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Plus, Lock, Edit2, AlertTriangle, Calculator, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { io, Socket } from 'socket.io-client';

// Define interfaces for data structures
interface Candidate {
  id: string;
  name: string;
  photo?: string;
  position: string;
  partyId?: string;
}

interface Party {
  id?: string;
  name: string;
  candidates: Candidate[];
}

interface Result {
  candidateId: string;
  voteCount: number;
  calculatedVotes?: number;
  candidate?: {
    id: string;
    name: string;
    photo?: string;
    position: string;
    partyId?: string;
  };
}

interface Round {
  id: string;
  roundNumber: number;
  status: 'DRAFT' | 'PUBLISHED';
  voteValue: number;
  results: Result[];
  createdAt?: string;
  countedAt?: string;
}

interface Booth {
  id: string;
  boothNumber: number;
  voterCount: number;
  totalVotesCounted: number;
  status: 'PENDING' | 'COUNTING' | 'COMPLETED';
  countingRounds: Round[];
}

interface VoteEntry {
  candidateId: string;
  votes: number;
  calculatedVotes?: number;
}

interface RoundDialogProps {
  isEditing?: boolean;
  entries: VoteEntry[];
  voteValue: number;
  parties: Party[];
  onVoteChange: (candidateId: string, value: string) => void;
  onVoteValueChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

// Mock data for testing when API data is not available
const mockParties: Party[] = [
  {
    name: 'Party A',
    candidates: [
      { id: '1', name: 'John Smith', position: 'PRESIDENT' },
      { id: '2', name: 'Emily Johnson', position: 'SECRETARY' },
    ],
  },
  {
    name: 'Party B',
    candidates: [
      { id: '3', name: 'Sarah Williams', position: 'PRESIDENT' },
      { id: '4', name: 'David Miller', position: 'SECRETARY' },
    ],
  },
];

// Memoized RoundDialog component
const RoundDialog = React.memo(({
  isEditing = false,
  entries,
  voteValue,
  parties,
  onVoteChange,
  onVoteValueChange,
  onSave,
  onCancel
}: RoundDialogProps) => {
  // Check if parties is valid, if not, use mockParties for testing
  const validParties = Array.isArray(parties) && parties.length > 0 ? parties : mockParties;

  // Group candidates by party for display
  const groupedCandidates = useMemo(() => {
    return validParties.reduce((acc: Record<string, Candidate[]>, party: Party) => {
      acc[party.name] = party.candidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        position: candidate.position,
        party: party.name,
        photo: candidate.photo,
      }));
      return acc;
    }, {});
  }, [validParties]);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Round' : 'Add New Round'}</DialogTitle>
        <DialogDescription>
          Enter the vote counts for all candidates in this round.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
          <Calculator className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <label className="text-sm font-medium text-blue-900">Vote Value</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={voteValue}
              onChange={(e) => onVoteValueChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="text-sm text-blue-600">
            Each vote will be multiplied by this value
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedCandidates).map(([party, candidates]) => (
            <div key={party} className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">{party}</h3>
              <div className="space-y-3">
                {candidates.map((candidate) => {
                  const entry = entries.find(e => e.candidateId === candidate.id);
                  const votes = entry?.votes || 0;
                  const calculatedVotes = entry?.calculatedVotes !== undefined
                    ? entry.calculatedVotes
                    : Number((votes * voteValue).toFixed(2));

                  return (
                    <div key={candidate.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-gray-500">{candidate.position}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Input
                            type="number"
                            min="0"
                            value={votes}
                            onChange={(e) => onVoteChange(candidate.id, e.target.value)}
                            className="text-right"
                          />
                        </div>
                        <div className="w-32 text-right">
                          <p className="text-sm text-gray-500">Calculated Votes</p>
                          <p className="font-medium">{calculatedVotes}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          {isEditing ? 'Update Round' : 'Create Round'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
});

RoundDialog.displayName = 'RoundDialog';

const CountingPanel = () => {
  const navigate = useNavigate();
  const { id: electionId } = useParams<{ id: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [parties, setParties] = useState<Party[]>([]);

  const [isAddingRound, setIsAddingRound] = useState(false);
  const [isEditingRound, setIsEditingRound] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [newRoundEntries, setNewRoundEntries] = useState<VoteEntry[]>([]);
  const [voteValue, setVoteValue] = useState(1);

  const [openBooths, setOpenBooths] = useState<string[]>([]);
  const [openRounds, setOpenRounds] = useState<string[]>([]);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to access this feature.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Create socket connection with auth token
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Real-time counting connection lost",
        variant: "destructive",
      });
    });

    socketInstance.on('electionData', (data) => {
      // Handle initial election data
      if (data) {
        console.log('Received election data:', data);

        if (data.booths) {
          setBooths(data.booths);
        }

        if (data.parties) {
          setParties(data.parties);
        } else {
          // Use mock data if no parties are received
          setParties(mockParties);
        }
      }
    });

    socketInstance.on('voteCountUpdated', (data) => {
      // Handle updated vote count
      if (data && data.boothId && data.roundId) {
        console.log('Vote count updated:', data);

        setBooths(prevBooths => {
          // Make a deep copy to ensure React detects the changes
          const updatedBooths = prevBooths.map(booth => {
            if (booth.id === data.boothId) {
              // Check if the round already exists in this booth
              const roundExists = booth.countingRounds.some(round => round.id === data.roundId);

              if (roundExists) {
                // Update existing round
                return {
                  ...booth,
                  countingRounds: booth.countingRounds.map(round =>
                    round.id === data.roundId
                      ? {
                        ...round,
                        results: data.results || round.results as Round['results']
                      }
                      : round
                  )
                };
              } else {
                // Add new round if it doesn't exist
                const newRound: Round = {
                  id: data.roundId,
                  roundNumber: booth.countingRounds.length + 1,
                  status: 'DRAFT',
                  voteValue: data.voteValue || 1,
                  results: data.results || [],
                  createdAt: new Date().toISOString(),
                };

                return {
                  ...booth,
                  countingRounds: [...booth.countingRounds, newRound]
                };
              }
            }
            return booth;
          });

          return updatedBooths;
        });

        const boothName = booths.find(b => b.id === data.boothId)?.boothNumber || 'selected booth';
        toast({
          title: "Vote Count Updated",
          description: `New votes received for Booth ${boothName}`,
        });
      }
    });

    socketInstance.on('roundPublished', (data) => {
      // Handle published round
      if (data && data.roundId) {
        setBooths(prevBooths => prevBooths.map(booth => {
          // We don't know which booth this round belongs to, so check all booths
          const updatedBooth = { ...booth };
          const roundIndex = booth.countingRounds.findIndex(r => r.id === data.roundId);

          if (roundIndex !== -1) {
            updatedBooth.countingRounds = [...booth.countingRounds];
            updatedBooth.countingRounds[roundIndex] = {
              ...updatedBooth.countingRounds[roundIndex],
              status: 'PUBLISHED',
              results: data.results || updatedBooth.countingRounds[roundIndex].results
            };
          }

          return updatedBooth;
        }));

        toast({
          title: "Round Published",
          description: "A counting round has been published",
        });
      }
    });

    socketInstance.on('boothCountingStarted', (data) => {
      // Handle booth counting started
      if (data && data.boothId) {
        setBooths(prevBooths => prevBooths.map(booth =>
          booth.id === data.boothId
            ? { ...booth, status: 'COUNTING' }
            : booth
        ));

        const boothName = booths.find(b => b.id === data.boothId)?.boothNumber || 'selected booth';
        toast({
          title: "Counting Started",
          description: `Started counting for Booth ${boothName}`,
        });
      }
    });

    socketInstance.on('countingError', (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred during counting",
        variant: "destructive",
      });
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [electionId, navigate]);

  // Reset entries when opening the add dialog
  useEffect(() => {
    if (isAddingRound) {
      // Get a flattened list of all candidates from all parties
      const allCandidates = parties.flatMap(party =>
        party.candidates.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          position: candidate.position,
          party: party.name,
        }))
      );

      // If no candidates from parties, use mockCandidates as fallback
      const candidatesToUse = allCandidates.length > 0 ? allCandidates :
        mockParties.flatMap(party => party.candidates);

      setNewRoundEntries(candidatesToUse.map(candidate => ({
        candidateId: candidate.id,
        votes: 0,
        calculatedVotes: 0,
      })));
      setVoteValue(1);
    }
  }, [isAddingRound, parties]);

  const calculateVotes = useCallback((entries: VoteEntry[], value: number) => {
    return entries.map(entry => ({
      ...entry,
      calculatedVotes: Number((entry.votes * value).toFixed(2))
    }));
  }, []);

  const validateVoteValue = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 1;
    }
    return Math.round(numValue * 100) / 100;
  }, []);

  const handleVoteChange = useCallback((candidateId: string, value: string) => {
    const votes = parseInt(value) || 0;
    if (votes < 0) return;

    console.log("vote value:", voteValue);

    setNewRoundEntries(prev => {
      const updatedEntries = prev.map(entry =>
        entry.candidateId === candidateId
          ? {
            ...entry,
            votes,
            calculatedVotes: Number((votes * voteValue).toFixed(2))
          }
          : entry
      );
      return updatedEntries;
    });
  }, [voteValue]);

  const handleVoteValueChange = useCallback((value: string) => {
    const newValue = validateVoteValue(value);
    setVoteValue(newValue);

    setNewRoundEntries(prev =>
      prev.map(entry => ({
        ...entry,
        calculatedVotes: Number((entry.votes * newValue).toFixed(2))
      }))
    );
  }, [validateVoteValue]);

  const handleEditRound = useCallback((boothId: string, roundId: string) => {
    const booth = booths.find(b => b.id === boothId);
    const round = booth?.countingRounds.find(r => r.id === roundId);

    if (booth && round && round.status === 'DRAFT') {
      setSelectedBoothId(boothId);
      setEditingRoundId(roundId);
      setVoteValue(round.voteValue);

      // Map round results to vote entries
      const entries = round.results.map(result => ({
        candidateId: result.candidateId,
        votes: result.voteCount,
        calculatedVotes: result.calculatedVotes
      }));

      // Add missing candidates with zero votes
      const allCandidateIds = new Set(parties.flatMap(p => p.candidates.map(c => c.id)));
      const existingCandidateIds = new Set(entries.map(e => e.candidateId));

      const missingEntries = Array.from(allCandidateIds)
        .filter(id => !existingCandidateIds.has(id))
        .map(id => ({
          candidateId: id,
          votes: 0,
          calculatedVotes: 0
        }));

      setNewRoundEntries([...entries, ...missingEntries]);
      setIsEditingRound(true);
    }
  }, [booths, parties]);

  const handleUpdateRound = useCallback(() => {
    if (!selectedBoothId || !editingRoundId || !socket || !electionId) return;

    if (newRoundEntries.every(entry => entry.votes === 0)) {
      toast({
        title: "Invalid Entries",
        description: "At least one candidate must have votes.",
        variant: "destructive",
      });
      return;
    }

    console.log('Updating round with entries:', newRoundEntries);

    // Find the round to determine round number
    const booth = booths.find(b => b.id === selectedBoothId);
    const round = booth?.countingRounds.find(r => r.id === editingRoundId);

    if (!round) {
      toast({
        title: "Error",
        description: "Could not find the round to update.",
        variant: "destructive",
      });
      return;
    }

    // Convert to DTO format for backend
    const roundData = {
      electionId,
      boothId: selectedBoothId,
      roundId: editingRoundId,
      roundNumber: round.roundNumber,
      voteValue,
      results: newRoundEntries.map(entry => ({
        candidateId: entry.candidateId,
        voteCount: entry.votes
      }))
    };

    console.log('Round data to update:', roundData);

    // Send to server via WebSocket
    socket.emit('submitVoteCount', roundData, (response: any) => {
      if (response && response.success) {
        // Update the round in our local state if it wasn't updated by the socket event
        if (response.result) {
          setBooths(prevBooths => prevBooths.map(booth => {
            if (booth.id === selectedBoothId) {
              return {
                ...booth,
                countingRounds: booth.countingRounds.map(r =>
                  r.id === editingRoundId
                    ? {
                      ...r,
                      voteValue: voteValue,
                      results: response.result.results || r.results
                    }
                    : r
                )
              };
            }
            return booth;
          }));
        }

        toast({
          title: "Round Updated",
          description: "The round has been updated successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: response?.error || "Failed to update round",
          variant: "destructive",
        });
      }
    });

    setIsEditingRound(false);
    setEditingRoundId(null);
    setSelectedBoothId(null);
  }, [selectedBoothId, editingRoundId, newRoundEntries, voteValue, socket, electionId, booths]);

  const handleAddRound = useCallback(() => {
    if (!selectedBoothId || !socket || !electionId) return;

    if (newRoundEntries.every(entry => entry.votes === 0)) {
      toast({
        title: "Invalid Entries",
        description: "At least one candidate must have votes.",
        variant: "destructive",
      });
      return;
    }

    // Get the next round number for this booth
    const booth = booths.find(b => b.id === selectedBoothId);
    const nextRoundNumber = booth?.countingRounds.length ?
      Math.max(...booth.countingRounds.map(r => r.roundNumber)) + 1 : 1;

    // Convert to DTO format for backend
    const roundData = {
      electionId,
      boothId: selectedBoothId,
      roundNumber: nextRoundNumber,
      voteValue,
      results: newRoundEntries.map(entry => ({
        candidateId: entry.candidateId,
        voteCount: entry.votes
      }))
    };

    // Send to server via WebSocket
    socket.emit('submitVoteCount', roundData, (response: any) => {
      if (response && response.success) {
        // Add the new round to our local state if it wasn't added by the socket event
        if (response.result) {
          setBooths(prevBooths => prevBooths.map(booth => {
            if (booth.id === selectedBoothId) {
              // Check if the round already exists
              const roundExists = booth.countingRounds.some(r => r.id === response.result.id);

              if (!roundExists) {
                return {
                  ...booth,
                  countingRounds: [...booth.countingRounds, {
                    id: response.result.id,
                    roundNumber: nextRoundNumber,
                    status: 'DRAFT',
                    voteValue: voteValue,
                    results: response.result.results || [],
                    createdAt: new Date().toISOString(),
                  }]
                };
              }
            }
            return booth;
          }));
        }

        toast({
          title: "Round Added",
          description: "The new round has been created successfully.",
        });
      } else {
        toast({
          title: "Operation Failed",
          description: response?.error || "Failed to add round",
          variant: "destructive",
        });
      }
    });

    setIsAddingRound(false);
    setSelectedBoothId(null);
  }, [selectedBoothId, newRoundEntries, voteValue, socket, electionId, booths]);

  const handleDialogClose = useCallback(() => {
    setIsAddingRound(false);
    setIsEditingRound(false);
    setEditingRoundId(null);
    setSelectedBoothId(null);

    // Reset entries
    setNewRoundEntries([]);
    setVoteValue(1);
  }, []);

  const handlePublishRound = useCallback((roundId: string, electionId: string) => {
    if (!socket || !electionId) return;

    // Send publish request to server
    socket.emit('publishCountingRound', { roundId, electionId }, (response: any) => {
      if (response && response.success) {
        toast({
          title: "Round Published",
          description: "The round has been published and results are now live.",
        });
      } else {
        toast({
          title: "Publish Failed",
          description: response?.error || "Failed to publish round",
          variant: "destructive",
        });
      }
    });
  }, [socket, electionId]);

  const handleStartCounting = useCallback((boothId: string) => {
    // Check if the selected booth is already counting
    const booth = booths.find(b => b.id === boothId);
    if (booth?.status === 'COUNTING') {
      toast({
        title: "Cannot Start Counting",
        description: "This booth is already in counting status.",
        variant: "destructive",
      });
      return;
    }

    // Check if previous booth is completed
    const boothIndex = booths.findIndex(b => b.id === boothId);
    if (boothIndex > 0) {
      const previousBooth = booths[boothIndex - 1];
      if (previousBooth.status !== 'COMPLETED') {
        toast({
          title: "Cannot Start Counting",
          description: "Please complete counting in the previous booth first.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!socket || !electionId) {
      toast({
        title: "Operation Failed",
        description: "Unable to establish connection to the server.",
        variant: "destructive",
      });
      return;
    }

    // Emit boothCountingStarted event
    socket.emit('startBoothCounting', { boothId, electionId }, (response: any) => {
      if (response && response.success) {
        // Update local state
        setBooths(prevBooths => prevBooths.map(booth =>
          booth.id === boothId
            ? { ...booth, status: 'COUNTING' }
            : booth
        ));

        toast({
          title: "Counting Started",
          description: `Started counting for Booth ${booths.find(b => b.id === boothId)?.boothNumber || 'selected booth'}`,
        });
      } else {
        toast({
          title: "Operation Failed",
          description: response?.error || "Failed to start counting.",
          variant: "destructive",
        });
      }
    });
  }, [booths, socket, electionId]);

  const handleCompleteCounting = useCallback((boothId: string) => {
    if (!socket || !electionId) return;

    const booth = booths.find(b => b.id === boothId);
    if (!booth) return;

    // Check if all rounds are published
    if (booth.countingRounds.some(round => round.status === 'DRAFT')) {
      toast({
        title: "Cannot Complete Counting",
        description: "Please publish all rounds before completing the count.",
        variant: "destructive",
      });
      return;
    }

    // Send complete counting request to server
    socket.emit('completeBoothCounting', { boothId, electionId }, (response: any) => {
      if (response && response.success) {
        // Update local state
        setBooths(prevBooths => prevBooths.map(b =>
          b.id === boothId
            ? { ...b, status: 'COMPLETED' }
            : b
        ));

        toast({
          title: "Counting Completed",
          description: `Completed counting for Booth ${booth.boothNumber}`,
        });
      } else {
        toast({
          title: "Operation Failed",
          description: response?.error || "Failed to complete counting.",
          variant: "destructive",
        });
      }
    });
  }, [booths, socket, electionId]);

  const canAddRound = useCallback((boothId: string) => {
    const booth = booths.find(b => b.id === boothId);
    if (!booth) return false;

    // Check if this booth is in counting status and has no draft rounds
    return booth.status === 'COUNTING' && !booth.countingRounds.some(round => round.status === 'DRAFT');
  }, [booths]);

  // Helper function to find a party name by candidate partyId
  const getPartyName = useCallback((partyId: string | undefined) => {
    if (!partyId) return 'Unknown Party';
    const party = parties.find(p => p.id === partyId);
    return party ? party.name : 'Unknown Party';
  }, [parties]);

  // Format date string
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }, []);

  // Calculate total votes for a round
  const calculateTotalVotes = useCallback((results: Result[]) => {
    return results.reduce((sum, result) => sum + result.voteCount, 0);
  }, []);

  // Determine if there are any rounds with draft status
  const hasDraftRounds = useCallback((booth: Booth) => {
    return booth.countingRounds.some(round => round.status === 'DRAFT');
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/elections')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Elections
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Counting Panel</h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-500">Manage and publish counting rounds</p>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Live Connection
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {booths.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No booths available. Waiting for data from server...</p>
          </Card>
        )}

        <Accordion
          type="multiple"
          value={openBooths}
          onValueChange={setOpenBooths}
          className="w-full space-y-4"
        >
          {booths.map((booth) => (
            <AccordionItem
              key={booth.id}
              value={booth.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">Booth {booth.boothNumber}</h3>
                    <Badge
                      variant={
                        booth.status === 'COMPLETED' ? 'default' :
                          booth.status === 'COUNTING' ? 'secondary' :
                            'outline'
                      }
                    >
                      {booth.status.charAt(0).toUpperCase() + booth.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      Counted: {booth.totalVotesCounted} / {booth.voterCount}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-6 py-4 space-y-4">
                  {/* Booth Actions */}
                  <div className="flex justify-end gap-2">
                    {booth.status === 'PENDING' && (
                      <Button
                        onClick={() => handleStartCounting(booth.id)}
                        className="flex items-center gap-2"
                        disabled={!isConnected}
                      >
                        <Plus className="h-4 w-4" />
                        Start Counting
                      </Button>
                    )}
                    {booth.status === 'COUNTING' && (
                      <>
                        {canAddRound(booth.id) && (
                          <Button
                            onClick={() => {
                              setSelectedBoothId(booth.id);
                              setIsAddingRound(true);
                            }}
                            variant="outline"
                            className="flex items-center gap-2"
                            disabled={!isConnected}
                          >
                            <Plus className="h-4 w-4" />
                            Add Round
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to complete counting for this booth? This action cannot be undone.")) {
                              handleCompleteCounting(booth.id);
                            }
                          }}
                          className="flex items-center gap-2"
                          disabled={!isConnected || hasDraftRounds(booth)}
                        >
                          <Lock className="h-4 w-4" />
                          Complete Counting
                        </Button>
                      </>
                    )}
                  </div>
                  {/* Rounds List */}
                  <div className="space-y-4">
                    {(!booth.countingRounds || booth.countingRounds.length === 0) && (
                      <div className="text-center p-4 text-gray-500">
                        No rounds available. {booth.status === 'COUNTING' ? 'Add a round to start counting.' : ''}
                      </div>
                    )}

                    <Accordion
                      type="multiple"
                      value={openRounds}
                      onValueChange={setOpenRounds}
                      className="space-y-4"
                    >
                      {booth.countingRounds &&
                        booth.countingRounds.map((round) => (
                          <AccordionItem
                            key={round.id}
                            value={round.id}
                            className="border rounded-lg overflow-hidden"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                              <CardHeader className="w-full flex flex-row justify-between items-center bg-gray-50 p-0">
                                {/* Left side - Title and Date */}
                                <div className="px-4 py-3 flex items-center">
                                  <div className="flex-1">
                                  <h4 className="font-medium">Round {round.roundNumber}</h4>
                                  <p className="text-sm text-gray-500">
                                    {round.status === 'DRAFT' ? 'Draft - Not Published' : 'Published'}
                                    {round.countedAt ? ` - ${formatDate(round.countedAt)}` : ''}
                                  </p>
                                  </div>
                                </div>

                                {/* Right side - Vote Value + Buttons */}
                                <div className="flex items-center gap-2 pr-4">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    Vote Value: {round.voteValue}
                                  </Badge>
                                  {round.status === 'DRAFT' ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditRound(booth.id, round.id);
                                        }}
                                        disabled={!isConnected}
                                      >
                                        <Edit2 className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePublishRound(round.id, electionId);
                                        }}
                                        disabled={!isConnected}
                                      >
                                        <Lock className="h-4 w-4 mr-1" />
                                        Publish
                                      </Button>
                                    </>
                                  ) : null}
                                </div>
                              </CardHeader>
                            </AccordionTrigger>

                            <AccordionContent>
                              <CardContent className="py-4">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm font-medium text-gray-500 px-2 py-1">
                                    <span>Candidate</span>
                                    <div className="flex gap-12">
                                      <span>Votes</span>
                                      <span>Calculated</span>
                                    </div>
                                  </div>
                                  {round.results.map((result) => (
                                    <div
                                      key={result.candidateId}
                                      className="flex justify-between items-center px-2 py-2 hover:bg-gray-50 rounded"
                                    >
                                      <div>
                                        <p className="font-medium">{result.candidate?.name || 'Unknown Candidate'}</p>
                                        <p className="text-xs text-gray-500">
                                          {result.candidate?.position || 'Unknown Position'} •
                                          {result.candidate?.partyId
                                            ? getPartyName(result.candidate.partyId)
                                            : 'Independent'}
                                        </p>
                                      </div>
                                      <div className="flex gap-12 items-center">
                                        <span className="text-right w-8">{result.voteCount}</span>
                                        <span className="text-right w-16 font-medium">
                                          {result.calculatedVotes !== undefined
                                            ? result.calculatedVotes
                                            : Number((result.voteCount * round.voteValue).toFixed(2))}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                  <div>
                                    <span className="text-sm text-gray-500">Total Votes:</span>
                                    <span className="ml-2 font-medium">
                                      {calculateTotalVotes(round.results)}
                                    </span>
                                  </div>
                                  {round.status === 'DRAFT' && (
                                    <div className="flex items-center text-amber-600">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      <span className="text-sm">Draft Round - Publish to finalize</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>

                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Add/Edit Round Dialog */}
      <Dialog
        open={isAddingRound || isEditingRound}
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
        }}
      >
        <RoundDialog
          isEditing={isEditingRound}
          entries={newRoundEntries}
          voteValue={voteValue}
          parties={parties}
          onVoteChange={handleVoteChange}
          onVoteValueChange={handleVoteValueChange}
          onSave={isEditingRound ? handleUpdateRound : handleAddRound}
          onCancel={handleDialogClose}
        />
      </Dialog>
    </div>
  );
};

export default CountingPanel;
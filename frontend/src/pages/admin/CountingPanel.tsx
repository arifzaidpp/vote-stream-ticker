import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Plus, Lock, Edit2, AlertTriangle, Calculator, ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Mock data - replace with actual data from your backend
const mockCandidates = [
  {
    id: '1',
    name: 'John Smith',
    party: 'Party A',
    position: 'President',
  },
  {
    id: '2',
    name: 'Emily Johnson',
    party: 'Party A',
    position: 'Secretary',
  },
  {
    id: '3',
    name: 'Sarah Williams',
    party: 'Party B',
    position: 'President',
  },
  {
    id: '4',
    name: 'David Miller',
    party: 'Party B',
    position: 'Secretary',
  },
];

interface Round {
  id: string;
  roundNumber: number;
  status: 'draft' | 'published';
  voteValue: number;
  entries: {
    candidateId: string;
    votes: number;
    calculatedVotes?: number;
  }[];
  timestamp?: string;
}

interface Booth {
  id: string;
  name: string;
  totalVoters: number;
  countedVoters: number;
  status: 'pending' | 'counting' | 'completed';
  rounds: Round[];
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
  onVoteChange: (candidateId: string, value: string) => void;
  onVoteValueChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

// Memoized RoundDialog component
const RoundDialog = React.memo(({
  isEditing = false,
  entries,
  voteValue,
  onVoteChange,
  onVoteValueChange,
  onSave,
  onCancel
}: RoundDialogProps) => {
  // Group candidates by party for display
  const groupedCandidates = useMemo(() => {
    return mockCandidates.reduce((acc, candidate) => {
      if (!acc[candidate.party]) {
        acc[candidate.party] = [];
      }
      acc[candidate.party].push(candidate);
      return acc;
    }, {} as Record<string, typeof mockCandidates>);
  }, []);

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
                  const calculatedVotes = entry?.calculatedVotes || 0;

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
  const [booths, setBooths] = useState<Booth[]>([
    {
      id: '1',
      name: 'Booth 1',
      totalVoters: 500,
      countedVoters: 270,
      status: 'counting',
      rounds: [
        {
          id: '1',
          roundNumber: 1,
          status: 'published',
          voteValue: 1,
          entries: [
            { candidateId: '1', votes: 150, calculatedVotes: 150 },
            { candidateId: '2', votes: 120, calculatedVotes: 120 },
          ],
          timestamp: '2024-03-15 14:30:00',
        },
        {
          id: '2',
          roundNumber: 2,
          status: 'draft',
          voteValue: 2,
          entries: [
            { candidateId: '3', votes: 180, calculatedVotes: 360 },
            { candidateId: '4', votes: 160, calculatedVotes: 320 },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Booth 2',
      totalVoters: 600,
      countedVoters: 0,
      status: 'pending',
      rounds: [],
    },
  ]);

  const [isAddingRound, setIsAddingRound] = useState(false);
  const [isEditingRound, setIsEditingRound] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [newRoundEntries, setNewRoundEntries] = useState<VoteEntry[]>([]);
  const [voteValue, setVoteValue] = useState(1);

  // Reset entries when opening the add dialog
  useEffect(() => {
    if (isAddingRound) {
      setNewRoundEntries(mockCandidates.map(candidate => ({
        candidateId: candidate.id,
        votes: 0,
        calculatedVotes: 0,
      })));
      setVoteValue(1);
    }
  }, [isAddingRound]);

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
    const round = booth?.rounds.find(r => r.id === roundId);
    
    if (booth && round && round.status === 'draft') {
      setSelectedBoothId(boothId);
      setEditingRoundId(roundId);
      setVoteValue(round.voteValue);
      
      const entries = mockCandidates.map(candidate => {
        const existingEntry = round.entries.find(e => e.candidateId === candidate.id);
        return existingEntry || {
          candidateId: candidate.id,
          votes: 0,
          calculatedVotes: 0
        };
      });
      
      setNewRoundEntries(entries);
      setIsEditingRound(true);
    }
  }, [booths]);

  const handleUpdateRound = useCallback(() => {
    if (!selectedBoothId || !editingRoundId) return;

    if (newRoundEntries.every(entry => entry.votes === 0)) {
      toast({
        title: "Invalid Entries",
        description: "At least one candidate must have votes.",
        variant: "destructive",
      });
      return;
    }

    const updatedEntries = calculateVotes(newRoundEntries, voteValue);
    setBooths(prevBooths => prevBooths.map(booth =>
      booth.id === selectedBoothId
        ? {
            ...booth,
            rounds: booth.rounds.map(round =>
              round.id === editingRoundId
                ? { ...round, entries: updatedEntries, voteValue }
                : round
            )
          }
        : booth
    ));

    setIsEditingRound(false);
    setEditingRoundId(null);
    setSelectedBoothId(null);
    toast({
      title: "Round Updated",
      description: "The round has been updated successfully.",
    });
  }, [selectedBoothId, editingRoundId, newRoundEntries, voteValue, calculateVotes]);

  const handleAddRound = useCallback(() => {
    if (!selectedBoothId) return;

    if (newRoundEntries.every(entry => entry.votes === 0)) {
      toast({
        title: "Invalid Entries",
        description: "At least one candidate must have votes.",
        variant: "destructive",
      });
      return;
    }

    const booth = booths.find(b => b.id === selectedBoothId);
    if (!booth) return;

    const calculatedEntries = calculateVotes(newRoundEntries, voteValue);
    const newRound: Round = {
      id: Date.now().toString(),
      roundNumber: booth.rounds.length + 1,
      status: 'draft',
      voteValue: voteValue,
      entries: calculatedEntries,
    };

    setBooths(prevBooths => prevBooths.map(b =>
      b.id === selectedBoothId
        ? { ...b, rounds: [...b.rounds, newRound] }
        : b
    ));
    
    setIsAddingRound(false);
    setSelectedBoothId(null);
    
    toast({
      title: "Round Added",
      description: `Round ${newRound.roundNumber} has been created successfully.`,
    });
  }, [selectedBoothId, newRoundEntries, voteValue, booths, calculateVotes]);

  const handleDialogClose = useCallback(() => {
    setIsAddingRound(false);
    setIsEditingRound(false);
    setEditingRoundId(null);
    setSelectedBoothId(null);
    setNewRoundEntries(mockCandidates.map(candidate => ({
      candidateId: candidate.id,
      votes: 0,
      calculatedVotes: 0,
    })));
    setVoteValue(1);
  }, []);

  const handlePublishRound = useCallback((boothId: string, roundId: string) => {
    setBooths(prevBooths => prevBooths.map(booth => 
      booth.id === boothId
        ? {
            ...booth,
            rounds: booth.rounds.map(round =>
              round.id === roundId
                ? {
                    ...round,
                    status: 'published',
                    timestamp: new Date().toISOString()
                  }
                : round
            )
          }
        : booth
    ));

    toast({
      title: "Round Published",
      description: "The round has been published and results are now live.",
    });
  }, []);

  const handleStartCounting = useCallback((boothId: string) => {
    // Check if previous booth is completed
    const boothIndex = booths.findIndex(b => b.id === boothId);
    if (boothIndex > 0) {
      const previousBooth = booths[boothIndex - 1];
      if (previousBooth.status !== 'completed') {
        toast({
          title: "Cannot Start Counting",
          description: "Please complete counting in the previous booth first.",
          variant: "destructive",
        });
        return;
      }
    }

    setBooths(prevBooths => prevBooths.map(booth =>
      booth.id === boothId
        ? { ...booth, status: 'counting' }
        : booth
    ));

    toast({
      title: "Counting Started",
      description: `Started counting for ${booths.find(b => b.id === boothId)?.name}`,
    });
  }, [booths]);

  const handleCompleteCounting = useCallback((boothId: string) => {
    const booth = booths.find(b => b.id === boothId);
    if (!booth) return;

    // Check if all rounds are published
    if (booth.rounds.some(round => round.status === 'draft')) {
      toast({
        title: "Cannot Complete Counting",
        description: "Please publish all rounds before completing the count.",
        variant: "destructive",
      });
      return;
    }

    setBooths(prevBooths => prevBooths.map(b =>
      b.id === boothId
        ? { ...b, status: 'completed' }
        : b
    ));

    toast({
      title: "Counting Completed",
      description: `Completed counting for ${booth.name}`,
    });
  }, [booths]);

  const canAddRound = useCallback((boothId: string) => {
    const booth = booths.find(b => b.id === boothId);
    if (!booth) return false;

    // Check if this booth is counting and has no draft rounds
    return booth.status === 'counting' && !booth.rounds.some(round => round.status === 'draft');
  }, [booths]);

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
        <p className="text-gray-500 mt-1">Manage and publish counting rounds</p>
      </div>

      <div className="space-y-6">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {booths.map((booth) => (
            <AccordionItem
              key={booth.id}
              value={booth.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{booth.name}</h3>
                    <Badge
                      variant={
                        booth.status === 'completed' ? 'default' :
                        booth.status === 'counting' ? 'secondary' :
                        'outline'
                      }
                    >
                      {booth.status.charAt(0).toUpperCase() + booth.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      Counted: {booth.countedVoters} / {booth.totalVoters}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-6 py-4 space-y-4">
                  {/* Booth Actions */}
                  <div className="flex justify-end gap-2">
                    {booth.status === 'pending' && (
                      <Button
                        onClick={() => handleStartCounting(booth.id)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Start Counting
                      </Button>
                    )}
                    {booth.status === 'counting' && (
                      <Button
                        onClick={() => handleCompleteCounting(booth.id)}
                        className="flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Complete Counting
                      </Button>
                    )}
                  </div>

                  {/* Rounds List */}
                  <div className="space-y-4">
                    {booth.rounds.map((round) => (
                      <Card key={round.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg">Round {round.roundNumber}</h3>
                            <Badge
                              variant={round.status === 'published' ? 'default' : 'secondary'}
                            >
                              {round.status === 'published' ? (
                                <Lock className="mr-1 h-3 w-3" />
                              ) : (
                                <Edit2 className="mr-1 h-3 w-3" />
                              )}
                              {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-800">
                              Vote Value: {round.voteValue}
                            </Badge>
                          </div>
                          {round.timestamp && (
                            <span className="text-sm text-gray-500">
                              Published: {new Date(round.timestamp).toLocaleString()}
                            </span>
                          )}
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            {round.entries.map((entry) => {
                              const candidate = mockCandidates.find(c => c.id === entry.candidateId);
                              return (
                                <div key={entry.candidateId} className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">{candidate?.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">
                                      ({candidate?.party} - {candidate?.position})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500">
                                      Base votes: {entry.votes}
                                    </span>
                                    <span className="font-bold">
                                      {entry.calculatedVotes} total votes
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                        {round.status === 'draft' && (
                          <CardFooter className="flex justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => handleEditRound(booth.id, round.id)}
                              className="flex items-center gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Round
                            </Button>
                            <Button
                              onClick={() => handlePublishRound(booth.id, round.id)}
                              className="flex items-center gap-2"
                            >
                              <Lock className="h-4 w-4" />
                              Publish Round
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* Add New Round */}
                  {canAddRound(booth.id) && (
                    <Dialog open={isAddingRound} onOpenChange={setIsAddingRound}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedBoothId(booth.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Round
                        </Button>
                      </DialogTrigger>
                      <RoundDialog
                        entries={newRoundEntries}
                        voteValue={voteValue}
                        onVoteChange={handleVoteChange}
                        onVoteValueChange={handleVoteValueChange}
                        onSave={handleAddRound}
                        onCancel={handleDialogClose}
                      />
                    </Dialog>
                  )}

                  {/* Edit Round Dialog */}
                  <Dialog open={isEditingRound} onOpenChange={setIsEditingRound}>
                    <RoundDialog
                      isEditing
                      entries={newRoundEntries}
                      voteValue={voteValue}
                      onVoteChange={handleVoteChange}
                      onVoteValueChange={handleVoteValueChange}
                      onSave={handleUpdateRound}
                      onCancel={handleDialogClose}
                    />
                  </Dialog>

                  {booth.status === 'counting' && booth.rounds.some(round => round.status === 'draft') && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <p className="text-sm text-yellow-700">
                        Please publish the current round before adding a new one.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CountingPanel;
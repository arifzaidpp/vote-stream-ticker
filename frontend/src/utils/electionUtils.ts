
interface Candidate {
  name: string;
  partyName: string;
  partyColor: string;
  votes: number;
}

export const getLeadingCandidates = (boothData: any[]) => {
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

export const getCandidateComparison = (boothData: any[]) => {
  const presidents = boothData.map(party => ({
    name: party.candidates[0].name,
    partyName: party.partyName,
    partyColor: party.color,
    votes: party.candidates[0].votes,
    rank: 0,
  })).sort((a, b) => b.votes - a.votes)
    .map((candidate, index) => ({...candidate, rank: index + 1}));
  
  const secretaries = boothData.map(party => ({
    name: party.candidates[1].name,
    partyName: party.partyName,
    partyColor: party.color,
    votes: party.candidates[1].votes,
    rank: 0,
  })).sort((a, b) => b.votes - a.votes)
    .map((candidate, index) => ({...candidate, rank: index + 1}));
  
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

export const getViewData = (activeView: string, totalData: any[], booth1Data: any[], booth2Data: any[], totalVotes: number, pendingVotes: number, countingPercentage: number) => {
  let data = [];
  let totalVotesForView = 0;
  
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

export const getActiveViewTitle = (activeView: string) => {
  if (activeView === 'booth1') return 'Booth 1';
  if (activeView === 'booth2') return 'Booth 2';
  return 'Total';
};

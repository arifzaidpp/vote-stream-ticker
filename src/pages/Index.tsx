
import React from 'react';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import CandidateComparison from '@/components/CandidateComparison';
import BoothView from '@/components/BoothView';
import { useElectionData, booth1Data, booth2Data } from '@/hooks/useElectionData';
import { newsMessages } from '@/constants/newsMessages';
import { getLeadingCandidates, getCandidateComparison, getViewData, getActiveViewTitle } from '@/utils/electionUtils';

const Index = () => {
  const {
    totalVotes,
    pendingVotes,
    countingPercentage,
    activeView,
    totalData,
    handleViewSwitch
  } = useElectionData();
  
  const activeViewStats = getViewData(activeView, totalData, booth1Data, booth2Data, totalVotes, pendingVotes, countingPercentage);
  const leadingCandidates = 
    activeView === 'booth1' ? getLeadingCandidates(booth1Data) :
    activeView === 'booth2' ? getLeadingCandidates(booth2Data) :
    getLeadingCandidates(totalData);
  const candidateComparison = getCandidateComparison(totalData);
  
  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-hidden p-3">
        <div className="grid grid-rows-7 gap-3 h-full">
          <div className="row-span-5">
            <BoothView
              boothName={getActiveViewTitle(activeView)}
              partyData={activeViewStats.data}
              leadingCandidates={leadingCandidates}
              totalVotes={activeViewStats.totalVotes}
              pendingVotes={activeViewStats.pendingVotes}
              countingPercentage={activeViewStats.countingPercentage}
              onSwitch={handleViewSwitch}
              autoSwitchInterval={10000}
            />
          </div>
          
          <div className="row-span-2">
            <CandidateComparison
              presidents={candidateComparison.presidents}
              secretaries={candidateComparison.secretaries}
              treasurers={candidateComparison.treasurers}
            />
          </div>
        </div>
      </main>
      
      <NewsTicker messages={newsMessages} />
    </div>
  );
};

export default Index;

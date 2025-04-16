import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ElectionCard from './ElectionCard';

interface Election {
  id: string;
  title: string;
  date: string;
  status: 'Draft' | 'Ongoing' | 'Completed';
}

const ElectionList: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [yearFilter, setYearFilter] = React.useState('all');

  // Mock data - replace with actual data source
  const elections: Election[] = [
    { id: '1', title: 'DHIU Election 2025', date: '15 April 2025', status: 'Ongoing' },
    { id: '2', title: 'Student Council 2024', date: '10 March 2024', status: 'Completed' },
    { id: '3', title: 'Department Elections', date: '1 May 2025', status: 'Draft' },
  ];

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || election.status === statusFilter;
    const matchesYear = yearFilter === 'all' || election.date.includes(yearFilter);
    return matchesSearch && matchesStatus && matchesYear;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search elections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Ongoing">Ongoing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredElections.map((election) => (
          <ElectionCard
            key={election.id}
            title={election.title}
            date={election.date}
            status={election.status}
            onClickView={() => console.log('View', election.id)}
            onClickEdit={() => console.log('Edit', election.id)}
            onClickDelete={() => console.log('Delete', election.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ElectionList;
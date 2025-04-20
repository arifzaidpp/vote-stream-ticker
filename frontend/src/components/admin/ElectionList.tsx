import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { gql } from 'graphql-tag';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ElectionCard from './ElectionCard';
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

// Define the GraphQL query
const GET_ELECTIONS = gql`
  query Elections($pagination: PaginationWithSearchInput) {
    elections(pagination: $pagination) {
      total
      hasMore
      items {
        id
        name
        logo
        status
        accessCode
        totalVoters
        votingCompletion
        createdAt
        updatedAt
        booths {
          id
          boothNumber
          voterCount
          totalVotesCounted
        }
        parties {
          id
          name
          color
          logo
          candidates {
            id
            name
            photo
            position
          }
        }
      }
    }
  }
`;

// Define the mutation for deleting an election
const DELETE_ELECTION = gql`
  mutation DeleteElection($deleteElectionId: String!) {
    deleteElection(id: $deleteElectionId) {
      id
      name
    }
  }
`;

interface Election {
  accessCode: string;
  id: string;
  name: string;
  logo?: string;
  status: 'Draft' | 'Ongoing' | 'Completed';
  createdAt: string;
  updatedAt: string;
  totalVoters: number;
  votingCompletion: number;
}

interface ElectionsData {
  elections: {
    total: number;
    hasMore: boolean;
    items: Election[];
  };
}

interface PaginationInput {
  take: number | null;
  skip: number | null;
  search: string | null;
}

const ElectionList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [skip, setSkip] = useState(0);
  const [deletingElectionId, setDeletingElectionId] = useState<string | null>(null);
  const take = 10; // Number of items to fetch per request
  const navigate = useNavigate();
  const client = useApolloClient();

  // Prepare pagination variables for the query
  const variables = {
    pagination: {
      take,
      skip,
      search: searchTerm || null
    }
  };

  // Execute the query
  const { loading, error, data, refetch } = useQuery<ElectionsData>(GET_ELECTIONS, {
    variables
  });

  // Update the query when filters change
  useEffect(() => {
    // Reset skip when search term changes
    if (searchTerm !== variables.pagination.search) {
      setSkip(0);
    }
    refetch({
      pagination: {
        take,
        skip,
        search: searchTerm || null
      }
    });
  }, [searchTerm, skip, refetch]);

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSkip(0); // Reset pagination when search changes
  };

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Client-side filtering for status and year since they're not in the pagination object
  const filteredElections = data?.elections.items.filter(election => {
    const matchesStatus = statusFilter === 'all' || election.status === statusFilter;
    const matchesYear = yearFilter === 'all' || 
      new Date(election.createdAt).getFullYear().toString() === yearFilter;
    return matchesStatus && matchesYear;
  }) || [];

  const loadMore = () => {
    setSkip(prevSkip => prevSkip + take);
  };

  // Delete election mutation with improved structure
  const [deleteElectionMutation] = useMutation(DELETE_ELECTION, {
    onCompleted: (data) => {
      if (data?.deleteElection) {
        toast({
          title: "Election Deleted",
          description: `"${data.deleteElection.name}" has been successfully deleted.`,
          variant: "default",
        });
        refetch(); // Refresh the list after successful deletion
      } else {
        toast({
          title: "Delete Error",
          description: "Failed to delete election. Unexpected response format.",
          variant: "destructive",
        });
      }
      setDeletingElectionId(null); // Reset the deleting state
    },
    onError: (error) => {
      console.error('Error deleting election:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "An error occurred while deleting the election.",
        variant: "destructive",
      });
      setDeletingElectionId(null); // Reset the deleting state
    }
  });
  
  const handleDeleteElection = (election: Election) => {
    if (window.confirm(`Are you sure you want to delete the election "${election.name}"?`)) {
      setDeletingElectionId(election.id); // Set which specific election is being deleted
      try {
        deleteElectionMutation({
          variables: { deleteElectionId: election.id },
          refetchQueries: [{ query: GET_ELECTIONS, variables }],
        });
      } catch (error) {
        console.error('Error initiating delete election:', error);
        toast({
          title: "Delete Error",
          description: "Failed to initiate delete operation.",
          variant: "destructive",
        });
        setDeletingElectionId(null); // Reset on error
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search elections..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="md:w-1/3"
        />
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setSkip(0); // Reset pagination when filter changes
        }}>
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
        <Select value={yearFilter} onValueChange={(value) => {
          setYearFilter(value);
          setSkip(0); // Reset pagination when filter changes
        }}>
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

      {loading && skip === 0 && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-4" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          Error loading elections: {error.message}
        </div>
      )}

      {!loading && !error && data && (
        <div className="grid gap-4">
          {filteredElections.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              No elections found matching your criteria.
            </div>
          ) : (
            filteredElections.map((election) => (
              <ElectionCard
                key={election.id}
                title={election.name}
                date={formatDate(election.createdAt)}
                status={election.status}
                voterCount={election.totalVoters}
                accessCode={election.accessCode ? election.accessCode : 'N/A'}
                onClickCount={() => {
                  navigate(`/admin/elections/${election.id}/count`);
                }}
                onClickEdit={() => {
                  navigate(`/admin/elections/${election.id}/edit`);
                }}
                onClickDelete={() => handleDeleteElection(election)}
                isDeleting={deletingElectionId === election.id}
              />
            ))
          )}
        </div>
      )}

      {data && data.elections.hasMore && (
        <div className="flex justify-center mt-4">
          {loading && skip > 0 ? (
            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded cursor-not-allowed">
              Loading...
            </button>
          ) : (
            <button 
              onClick={loadMore}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ElectionList;
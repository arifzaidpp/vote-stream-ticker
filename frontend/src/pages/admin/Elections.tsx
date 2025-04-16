import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import ElectionList from '@/components/admin/ElectionList';
import { useNavigate } from 'react-router-dom';

const Elections = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Elections</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all elections</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate('/admin/elections/new')}
        >
          <PlusCircle className="h-5 w-5" />
          New Election
        </Button>
      </div>

      <ElectionList />
    </div>
  );
};

export default Elections;
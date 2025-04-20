import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import ElectionList from '@/components/admin/ElectionList';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql, useApolloClient } from "@apollo/client";
import { toast } from '@/components/ui/use-toast';

const Elections = () => {
  const navigate = useNavigate();
  const client = useApolloClient();

  // GraphQL mutation for user logout
  const LOGOUT_USER = gql`
    mutation Logout {
      logout {
        message
        success
      }
    }
  `;
  
  const [logoutUser] = useMutation(LOGOUT_USER, {
    onCompleted: (data) => {
      // Handle successful logout
      if (data?.logout?.success) {
        toast({
          title: "Logout Successful",
          description: data.logout.message,
          variant: "default",
        });
      } else {
        console.log("Logout response:", data);
      }
      
      // Always clean up local storage and navigate away
      performClientSideLogout();
    },
    onError: (error) => {
      // Handle error - this might be the authentication error
      console.error("Logout error:", error);
      toast({
        title: "Server Logout Failed",
        description: "Logging out locally instead",
        variant: "default",
      });
      
      // Even if server logout fails, do local logout
      performClientSideLogout();
    }
  });
  
  const performClientSideLogout = () => {
    // Clean up local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset Apollo cache
    client.resetStore();
    
    // Navigate to login page
    navigate('/login');
  };
  
  const handleLogout = () => {
    // Try server-side logout first
    try {
      logoutUser();
    } catch (e) {
      console.error("Error initiating logout:", e);
      // Fallback to client-side logout
      performClientSideLogout();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Elections</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all elections</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate('/admin/elections/new')}
          >
            <PlusCircle className="h-5 w-5" />
            New Election
          </Button>
          <Button 
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      <ElectionList />
    </div>
  );
};

export default Elections;
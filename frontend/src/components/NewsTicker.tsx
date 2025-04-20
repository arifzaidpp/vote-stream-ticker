import { toast } from '@/hooks/use-toast';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface NewsTickerProps {
  messages: string[];
  interval?: number;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ messages, interval = 8000 }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);

  const client = useApolloClient();
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
      if (data?.logout?.success) {
        toast({
          title: 'Logout Successful',
          description: data.logout.message,
          variant: 'default',
        });
      } else {
        console.log('Logout response:', data);
      }
      performClientSideLogout();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      toast({
        title: 'Server Logout Failed',
        description: 'Logging out locally instead',
        variant: 'default',
      });
      performClientSideLogout();
    },
  });

  const performClientSideLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    client.resetStore();
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleLogout = () => {
    try {
      logoutUser();
    } catch (e) {
      console.error('Error initiating logout:', e);
      performClientSideLogout();
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="bg-red-600 text-white py-1 shadow-md z-10">
      <div className="container mx-auto flex items-center">
        <div className="mr-2 bg-white text-red-600 px-2 py-0.5 font-bold rounded text-xs">
          BREAKING
        </div>

        <div className="overflow-hidden flex-1">
          <p className="live-indicator pl-6 text-sm md:text-base font-medium whitespace-nowrap">
            {messages[currentMessage]}
          </p>
        </div>
        {isLoggedIn && (
           <div className="ml-2 text-xs md:text-sm font-medium cursor-pointer" onClick={handleLogout}>
           Logout
         </div>
        )}
        </div>
      </div>
  );
};

export default NewsTicker;

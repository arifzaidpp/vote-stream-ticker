import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

export function GoogleAuthButton() {
  const location = useLocation();
  const [error, setError] = useState('');
  const isSignup = location.pathname === '/signup';
  const params = new URLSearchParams(location.search);
  const isEffectCalled = useRef(false); // Ref to track effect execution

  // Get individual parameters from URL
  const success = params.get('success');
  const status = params.get('status');
  const message = params.get('message');

  useEffect(() => {
    if (isEffectCalled.current) return; // Skip if already executed
    isEffectCalled.current = true; // Mark as executed

    // Handle additional status-based messaging
    if (status === 'ACCOUNT_EXISTS') {
      setError('An account with this email already exists.<br />Please login instead.');
      toast({
        title: 'Account exists',
        description: 'An account with this email already exists. Please login instead.',
        variant: 'destructive',
      })
    } else if (status === 'ACCOUNT_NOT_FOUND') {
      setError('No account found with this email. Please sign up first.');
      toast({
        title: 'Account not found',
        description: 'No account found with this email. Please sign up first.',
        variant: 'destructive',
      })
    } else if (success === 'false') {
      setError('Authentication failed.');
      toast({
        title: 'Authentication failed',
        description: 'Authentication failed. Please try again.',
        variant: 'destructive',
      })
    } else if (success === 'true') {
      setError('');
    }

    // Clear query parameters in the URL without reloading the page
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState(null, '', newUrl);

  }, [success, status, message, ]);

  const handleGoogleAuth = () => {
    const authType = isSignup ? 'signup' : 'login';
    // Redirect to your Google authentication route
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/${authType}`;
  };

  return (
    <div className="space-y-2">
      <motion.button
        onClick={handleGoogleAuth}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 
                  dark:border-gray-600 rounded-md shadow-sm text-sm font-medium 
                  text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 
                  hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <img
          className="h-5 w-5 mr-2"
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
        />
        <span>Continue with Google</span>
      </motion.button>
      
      {error && (
        <p
          className="text-sm text-red-600 dark:text-red-400 text-center"
          dangerouslySetInnerHTML={{ __html: error }}
        />
      )}
    </div>
  );
}

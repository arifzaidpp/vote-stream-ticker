
import React, { useState, useEffect } from 'react';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };
  
  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
      <div className="py-2 px-3">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            DHIU Election 2025
          </h1>
          
          <div className="flex items-end">
            <p className="text-sm font-medium mr-2">{formatDate(currentTime)}</p>
            <p className="text-sm font-medium bg-black/30 px-2 py-1 rounded">{formatTime(currentTime)}</p>
          </div>
        </div>
      </div>
      <div className="bg-red-600/90 py-1">
        <div className="container mx-auto overflow-hidden">
          <p className="animate-ticker whitespace-nowrap text-sm">
            ⚡ LIVE UPDATES - Counting Underway - Third Round of Counting in Progress - 65% of Votes Counted - Stay Tuned for Final Results
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;

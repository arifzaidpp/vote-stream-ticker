
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
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">
          DHIU Election 2025
        </h1>
        
        <div className="flex flex-col items-center md:items-end">
          <p className="text-sm md:text-base font-medium">{formatDate(currentTime)}</p>
          <p className="text-sm md:text-base font-medium">{formatTime(currentTime)}</p>
        </div>
      </div>
      
      <div className="mt-2 overflow-hidden">
        <div className="whitespace-nowrap overflow-hidden relative">
          <div className="animate-ticker inline-block">
            <span className="mx-4 text-yellow-300 font-medium">
              ⚡ LIVE UPDATES - Counting Underway - Third Round of Counting in Progress - 65% of Votes Counted - Stay Tuned for Final Results
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;


import React, { useState, useEffect } from 'react';

interface NewsTickerProps {
  messages: string[];
  interval?: number;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ messages, interval = 8000 }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [messages, interval]);
  
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
      </div>
    </div>
  );
};

export default NewsTicker;

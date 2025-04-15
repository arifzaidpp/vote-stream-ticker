
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
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-2 shadow-md z-10">
      <div className="container mx-auto flex items-center">
        <div className="mr-4 bg-white text-red-600 px-2 py-1 font-bold rounded text-sm">
          BREAKING
        </div>
        
        <div className="overflow-hidden flex-1">
          <p className="live-indicator pl-6 text-base md:text-lg font-medium whitespace-nowrap">
            {messages[currentMessage]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;

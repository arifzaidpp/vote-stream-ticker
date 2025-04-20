
import { Award } from 'lucide-react';
import { useState, useEffect } from 'react';

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
        <div className="flex items-center space-x-2">
          <Award className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">
            DUIDC Election 2025
          </h1>
        </div>
        
        <div className="flex flex-col items-center md:items-end">
          <p className="text-sm md:text-base font-medium">{formatDate(currentTime)}</p>
          <p className="text-sm font-medium bg-black/30 px-2 py-1 rounded">{formatTime(currentTime)}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;


import React from 'react';
import {  WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  error 
}) => {
  if (isConnected) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-red-500 text-white px-4 py-2 shadow-lg">
        <div className="flex items-center justify-center gap-2 text-sm">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span className="font-medium">
            {error || "Connecting to chat server..."}
          </span>
        </div>
      </div>
    </div>
  );
};


'use client';


import { useSocket } from '@/contexts/SocketContext';
import { clsx } from 'clsx';

export function ConnectionStatus() {
  const { isConnected, onlineUsers } = useSocket();

  return (
    <div className="flex items-center space-x-3">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div
          className={clsx(
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-xs text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Online Users Count */}
      {isConnected && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">
            {onlineUsers.length} online
          </span>
        </div>
      )}
    </div>
  );
}

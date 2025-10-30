'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Toast } from './Toast';
import { TaskNotification } from '@/types';

export function ToastContainer() {
  const { notifications } = useSocket();
  const [activeToasts, setActiveToasts] = useState<TaskNotification[]>([]);

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      if (!latestNotification) return; // type guard

      // Check if this notification is already being shown as toast
      const isAlreadyShown = activeToasts.some(
        toast => toast.timestamp === latestNotification.timestamp
      );

      if (!isAlreadyShown) {
        setActiveToasts(prev => [latestNotification, ...prev].slice(0, 3));
      }
    }
  }, [notifications, activeToasts]);

  const removeToast = (timestamp: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.timestamp !== timestamp));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {activeToasts.map((notification, index) => (
        <div
          key={`${notification.timestamp}-${index}`}
          style={{ transform: `translateY(${index * 10}px)` }}
        >
          <Toast
            notification={notification}
            onClose={() => removeToast(notification.timestamp)}
            duration={5000}
          />
        </div>
      ))}
    </div>
  );
}

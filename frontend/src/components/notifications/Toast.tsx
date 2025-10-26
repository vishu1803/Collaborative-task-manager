'use client';

import React, { useEffect, useState } from 'react';
import { TaskNotification } from '@/types';
import { clsx } from 'clsx';

interface ToastProps {
  notification: TaskNotification;
  onClose: () => void;
  duration?: number;
}

export function Toast({ notification, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for slide out animation
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const getToastColor = (type: TaskNotification['type']) => {
    switch (type) {
      case 'created': return 'border-green-400 bg-green-50';
      case 'updated': return 'border-blue-400 bg-blue-50';
      case 'deleted': return 'border-red-400 bg-red-50';
      case 'assigned': return 'border-purple-400 bg-purple-50';
      case 'status_changed': return 'border-orange-400 bg-orange-50';
      case 'priority_changed': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getNotificationIcon = (type: TaskNotification['type']) => {
    switch (type) {
      case 'created': return '📝';
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      case 'assigned': return '👤';
      case 'status_changed': return '📊';
      case 'priority_changed': return '⚡';
      default: return '🔔';
    }
  };

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className={clsx(
        'rounded-lg border-l-4 p-4 shadow-lg',
        getToastColor(notification.type)
      )}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.message}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              From: {notification.actor.name}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

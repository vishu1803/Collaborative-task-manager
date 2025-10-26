'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useSocket } from '@/contexts/SocketContext';
import { TaskNotification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

export function NotificationDropdown() {
  const { notifications, clearNotification, clearAllNotifications, markNotificationAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getNotificationColor = (type: TaskNotification['type']) => {
    switch (type) {
      case 'created': return 'text-green-600';
      case 'updated': return 'text-blue-600';
      case 'deleted': return 'text-red-600';
      case 'assigned': return 'text-purple-600';
      case 'status_changed': return 'text-orange-600';
      case 'priority_changed': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-2xl mb-2">🔕</div>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification, index) => (
                  <div
                    key={`${notification.timestamp}-${index}`}
                    className={clsx(
                      'px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0',
                      !notification.read && 'bg-blue-50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <span className={clsx('text-xs font-medium', getNotificationColor(notification.type))}>
                            {notification.type.replace('_', ' ').toUpperCase()}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-900 mb-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                          <div className="flex space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => markNotificationAsRead(index)}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={() => clearNotification(index)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-2 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

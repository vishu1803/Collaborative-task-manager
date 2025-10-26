'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketClient, SocketEvents } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { TaskNotification } from '@/types';
import { invalidateTaskCache } from '@/lib/swr';

interface SocketContextType {
  isConnected: boolean;
  notifications: TaskNotification[];
  onlineUsers: Array<{ userId: string; name: string; timestamp: string }>;
  // Actions
  clearNotification: (index: number) => void;
  clearAllNotifications: () => void;
  markNotificationAsRead: (index: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; name: string; timestamp: string }>>([]);

  // Connect/disconnect socket based on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const socket = socketClient.connect(token);
        
        // Setup connection status listeners
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));
        
        console.log('🔌 Socket connection initiated for user:', user.name);
      }
    } else {
      socketClient.disconnect();
      setIsConnected(false);
      setNotifications([]);
      setOnlineUsers([]);
    }

    return () => {
      if (!isAuthenticated) {
        socketClient.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Setup task event listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleTaskCreated = (notification: TaskNotification) => {
      console.log('📝 Task created:', notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
      // Invalidate SWR cache to refresh data
      invalidateTaskCache();
    };

    const handleTaskUpdated = (notification: TaskNotification) => {
      console.log('✏️ Task updated:', notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50));
      invalidateTaskCache();
    };

    const handleTaskDeleted = (notification: TaskNotification) => {
      console.log('🗑️ Task deleted:', notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50));
      invalidateTaskCache();
    };

    const handleTaskAssigned = (notification: TaskNotification) => {
      console.log('👤 Task assigned:', notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50));
      invalidateTaskCache();
    };

    const handleTaskStatusChanged = (notification: TaskNotification) => {
      console.log('📊 Task status changed:', notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50));
      invalidateTaskCache();
    };

    const handleTaskPriorityChanged = (notification: TaskNotification) => {
      console.log('⚡ Task priority changed:', notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50));
      invalidateTaskCache();
    };

    const handleGeneralNotification = (notification: TaskNotification) => {
      console.log('🔔 General notification:', notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    };

    // User presence listeners
    const handleUserOnline = (data: { userId?: string; name?: string; users?: any[]; count?: number; timestamp: string }) => {
      if (data.users) {
        // Initial users list
        setOnlineUsers(data.users);
      } else if (data.userId && data.name) {
        // Single user came online
        setOnlineUsers(prev => {
          const exists = prev.some(u => u.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId!, name: data.name!, timestamp: data.timestamp }];
          }
          return prev;
        });
      }
    };

    const handleUserOffline = (data: { userId: string; name: string; timestamp: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    // Register all event listeners
    socketClient.on(SocketEvents.TASK_CREATED, handleTaskCreated);
    socketClient.on(SocketEvents.TASK_UPDATED, handleTaskUpdated);
    socketClient.on(SocketEvents.TASK_DELETED, handleTaskDeleted);
    socketClient.on(SocketEvents.TASK_ASSIGNED, handleTaskAssigned);
    socketClient.on(SocketEvents.TASK_STATUS_CHANGED, handleTaskStatusChanged);
    socketClient.on(SocketEvents.TASK_PRIORITY_CHANGED, handleTaskPriorityChanged);
    socketClient.on(SocketEvents.NOTIFICATION, handleGeneralNotification);
    socketClient.on(SocketEvents.USER_ONLINE, handleUserOnline);
    socketClient.on(SocketEvents.USER_OFFLINE, handleUserOffline);

    // Cleanup listeners on unmount
    return () => {
      socketClient.off(SocketEvents.TASK_CREATED, handleTaskCreated);
      socketClient.off(SocketEvents.TASK_UPDATED, handleTaskUpdated);
      socketClient.off(SocketEvents.TASK_DELETED, handleTaskDeleted);
      socketClient.off(SocketEvents.TASK_ASSIGNED, handleTaskAssigned);
      socketClient.off(SocketEvents.TASK_STATUS_CHANGED, handleTaskStatusChanged);
      socketClient.off(SocketEvents.TASK_PRIORITY_CHANGED, handleTaskPriorityChanged);
      socketClient.off(SocketEvents.NOTIFICATION, handleGeneralNotification);
      socketClient.off(SocketEvents.USER_ONLINE, handleUserOnline);
      socketClient.off(SocketEvents.USER_OFFLINE, handleUserOffline);
    };
  }, [isConnected]);

  const clearNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markNotificationAsRead = useCallback((index: number) => {
    setNotifications(prev => 
      prev.map((notification, i) => 
        i === index 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const value: SocketContextType = {
    isConnected,
    notifications,
    onlineUsers,
    clearNotification,
    clearAllNotifications,
    markNotificationAsRead,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

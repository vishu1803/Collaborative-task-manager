export enum SocketEvents {
  // Connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  
  // Authentication events
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  AUTHENTICATION_ERROR = 'authentication_error',
  
  // Task events
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_ASSIGNED = 'task:assigned',
  TASK_STATUS_CHANGED = 'task:status_changed',
  TASK_PRIORITY_CHANGED = 'task:priority_changed',
  
  // User presence events
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  
  // Notification events
  NOTIFICATION = 'notification'
}

export interface SocketUser {
  userId: string;
  socketId: string;
  email: string;
  name: string;
}

export interface TaskNotification {
  type: 'created' | 'updated' | 'deleted' | 'assigned' | 'status_changed' | 'priority_changed';
  task: any;
  message: string;
  timestamp: Date;
  actor: {
    id: string;
    name: string;
  };
}

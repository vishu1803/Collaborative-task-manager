import { default as io } from 'socket.io-client'; // for the io function
import type { Socket } from 'socket.io-client';   // only for the type

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketClient {
  private socket: typeof Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;

  connect(token: string): typeof Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('authenticated', (data: any) => {
      console.log('🔐 Socket authenticated:', data);
    });

    this.socket.on('authentication_error', (error: any) => {
      console.error('🚫 Socket authentication error:', error);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('🔌 Socket connection error:', error);
    });

    this.socket.on('error', (error: any) => {
      console.error('⚠️ Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  on(event: string, callback: Function): void {
    if (!this.socket) return;

    this.socket.on(event, callback as any);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as any);

      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocket(): typeof
  
  Socket | null {
    return this.socket;
  }
}

export const socketClient = new SocketClient();

export enum SocketEvents {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  AUTHENTICATED = 'authenticated',
  AUTHENTICATION_ERROR = 'authentication_error',
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_ASSIGNED = 'task:assigned',
  TASK_STATUS_CHANGED = 'task:status_changed',
  TASK_PRIORITY_CHANGED = 'task:priority_changed',
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  NOTIFICATION = 'notification',
}

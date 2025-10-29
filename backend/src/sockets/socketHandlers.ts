import { AuthenticatedSocket } from '../middleware/socketAuth';
import { socketManager } from './socketManager';
import { SocketEvents } from '../types/socket';

export const handleSocketConnection = (socket: AuthenticatedSocket): void => {
  // Add user to connected users
  socketManager.addUser(socket);

  // Send authenticated confirmation
  socket.emit(SocketEvents.AUTHENTICATED, {
    userId: socket.userId,
    user: socket.user,
    timestamp: new Date()
  });

  // Send online users list
  const onlineUsers = socketManager.getOnlineUsers();
  socket.emit(SocketEvents.USER_ONLINE, {
    users: onlineUsers,
    count: onlineUsers.length
  });

  // Handle disconnection
  socket.on(SocketEvents.DISCONNECT, () => {
    socketManager.removeUser(socket.id);
  });

  // Handle errors
  socket.on(SocketEvents.ERROR, (error) => {
    console.error('Socket error:', error);
  });

  // Log connection
  console.log(`🔌 Socket connected: ${socket.user?.name || 'Unknown'} (${socket.id})`);
};
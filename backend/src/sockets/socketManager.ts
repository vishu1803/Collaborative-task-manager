import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socketAuth';
import { SocketEvents, SocketUser, TaskNotification } from '../types/socket';

class SocketManager {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  initialize(io: SocketIOServer): void {
    this.io = io;
    console.log('✅ Socket Manager initialized');
  }

  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io not initialized');
    }
    return this.io;
  }

  // Add user connection
  addUser(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    const socketId = socket.id;

    const user: SocketUser = {
      userId,
      socketId,
      email: socket.user?.email || '',
      name: socket.user?.name || ''
    };

    this.connectedUsers.set(socketId, user);

    // Track multiple connections from same user
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);

    console.log(`✅ User connected: ${user.name} (${socketId})`);

    // Notify others that user is online
    socket.broadcast.emit(SocketEvents.USER_ONLINE, {
      userId,
      name: user.name,
      timestamp: new Date()
    });
  }

  // Remove user connection
  removeUser(socketId: string): void {
    const user = this.connectedUsers.get(socketId);
    if (!user) return;

    const { userId } = user;

    // Remove socket from user's socket set
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socketId);

      // If no more connections for this user, remove them completely
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);

        // Notify others that user is offline
        this.getIO().emit(SocketEvents.USER_OFFLINE, {
          userId,
          name: user.name,
          timestamp: new Date()
        });

        console.log(`❌ User offline: ${user.name}`);
      }
    }

    this.connectedUsers.delete(socketId);
    console.log(`🔌 User disconnected: ${user.name} (${socketId})`);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  // Get all online users
  getOnlineUsers(): SocketUser[] {
    const uniqueUsers = new Map<string, SocketUser>();
    
    this.connectedUsers.forEach(user => {
      if (!uniqueUsers.has(user.userId)) {
        uniqueUsers.set(user.userId, user);
      }
    });

    return Array.from(uniqueUsers.values());
  }

  // Emit to specific user (all their connections)
  emitToUser(userId: string, event: string, data: any): void {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.getIO().to(socketId).emit(event, data);
      });
    }
  }

  // Emit to multiple users
  emitToUsers(userIds: string[], event: string, data: any): void {
    userIds.forEach(userId => {
      this.emitToUser(userId, event, data);
    });
  }

  // Notify about task creation
  notifyTaskCreated(task: any, creatorName: string): void {
    const notification: TaskNotification = {
      type: 'created',
      task,
      message: `${creatorName} created a new task: "${task.title}"`,
      timestamp: new Date(),
      actor: {
        id: task.creatorId._id || task.creatorId,
        name: creatorName
      }
    };

    // Notify the assigned user
    const assignedUserId = task.assignedToId._id?.toString() || task.assignedToId.toString();
    this.emitToUser(assignedUserId, SocketEvents.TASK_CREATED, notification);
    this.emitToUser(assignedUserId, SocketEvents.TASK_ASSIGNED, notification);
    this.emitToUser(assignedUserId, SocketEvents.NOTIFICATION, notification);

    console.log(`📢 Task created notification sent to user: ${assignedUserId}`);
  }

  // Notify about task update
  notifyTaskUpdated(task: any, updaterName: string, changes: string[]): void {
    const notification: TaskNotification = {
      type: 'updated',
      task,
      message: `${updaterName} updated task: "${task.title}" (${changes.join(', ')})`,
      timestamp: new Date(),
      actor: {
        id: task.updatedBy || task.creatorId._id || task.creatorId,
        name: updaterName
      }
    };

    // Notify both creator and assigned user
    const creatorId = task.creatorId._id?.toString() || task.creatorId.toString();
    const assignedId = task.assignedToId._id?.toString() || task.assignedToId.toString();

    const usersToNotify = new Set([creatorId, assignedId]);

    usersToNotify.forEach(userId => {
      this.emitToUser(userId, SocketEvents.TASK_UPDATED, notification);
      this.emitToUser(userId, SocketEvents.NOTIFICATION, notification);
    });

    console.log(`📢 Task updated notification sent to ${usersToNotify.size} users`);
  }

  // Notify about task deletion
  notifyTaskDeleted(taskId: string, taskTitle: string, creatorId: string, assignedUserId: string, deleterName: string): void {
    const notification: TaskNotification = {
      type: 'deleted',
      task: { _id: taskId, title: taskTitle },
      message: `${deleterName} deleted task: "${taskTitle}"`,
      timestamp: new Date(),
      actor: {
        id: creatorId,
        name: deleterName
      }
    };

    // Notify the assigned user
    this.emitToUser(assignedUserId, SocketEvents.TASK_DELETED, notification);
    this.emitToUser(assignedUserId, SocketEvents.NOTIFICATION, notification);

    console.log(`📢 Task deleted notification sent to user: ${assignedUserId}`);
  }

  // Notify about status change
  notifyTaskStatusChanged(task: any, updaterName: string, oldStatus: string, newStatus: string): void {
    const notification: TaskNotification = {
      type: 'status_changed',
      task,
      message: `${updaterName} changed status of "${task.title}" from ${oldStatus} to ${newStatus}`,
      timestamp: new Date(),
      actor: {
        id: task.updatedBy || task.creatorId._id || task.creatorId,
        name: updaterName
      }
    };

    const creatorId = task.creatorId._id?.toString() || task.creatorId.toString();
    const assignedId = task.assignedToId._id?.toString() || task.assignedToId.toString();

    const usersToNotify = new Set([creatorId, assignedId]);

    usersToNotify.forEach(userId => {
      this.emitToUser(userId, SocketEvents.TASK_STATUS_CHANGED, notification);
      this.emitToUser(userId, SocketEvents.NOTIFICATION, notification);
    });

    console.log(`📢 Status change notification sent to ${usersToNotify.size} users`);
  }

  // Notify about priority change
  notifyTaskPriorityChanged(task: any, updaterName: string, oldPriority: string, newPriority: string): void {
    const notification: TaskNotification = {
      type: 'priority_changed',
      task,
      message: `${updaterName} changed priority of "${task.title}" from ${oldPriority} to ${newPriority}`,
      timestamp: new Date(),
      actor: {
        id: task.updatedBy || task.creatorId._id || task.creatorId,
        name: updaterName
      }
    };

    const creatorId = task.creatorId._id?.toString() || task.creatorId.toString();
    const assignedId = task.assignedToId._id?.toString() || task.assignedToId.toString();

    const usersToNotify = new Set([creatorId, assignedId]);

    usersToNotify.forEach(userId => {
      this.emitToUser(userId, SocketEvents.TASK_PRIORITY_CHANGED, notification);
      this.emitToUser(userId, SocketEvents.NOTIFICATION, notification);
    });

    console.log(`📢 Priority change notification sent to ${usersToNotify.size} users`);
  }

  // Notify about task reassignment
  notifyTaskReassigned(task: any, updaterName: string, oldAssigneeId: string, newAssigneeId: string): void {
    const notification: TaskNotification = {
      type: 'assigned',
      task,
      message: `${updaterName} reassigned task: "${task.title}"`,
      timestamp: new Date(),
      actor: {
        id: task.updatedBy || task.creatorId._id || task.creatorId,
        name: updaterName
      }
    };

    // Notify both old and new assignee
    this.emitToUser(oldAssigneeId, SocketEvents.TASK_UPDATED, notification);
    this.emitToUser(newAssigneeId, SocketEvents.TASK_ASSIGNED, notification);
    this.emitToUser(newAssigneeId, SocketEvents.NOTIFICATION, notification);

    console.log(`📢 Task reassignment notification sent to 2 users`);
  }
}

// Export singleton instance
export const socketManager = new SocketManager();

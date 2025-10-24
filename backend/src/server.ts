import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config/env';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.io
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.socketCorsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Socket.io connection handling (we'll implement this in the next phase)
    io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);
      
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`📚 API base URL: http://localhost:${config.port}/api`);
      if (config.nodeEnv === 'development') {
        console.log(`🎯 Frontend URL: ${config.frontendUrl}`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      
      httpServer.close(() => {
        console.log('💤 HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

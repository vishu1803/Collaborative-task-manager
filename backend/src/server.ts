import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config/env';
import { socketAuthMiddleware } from './middleware/socketAuth';
import { handleSocketConnection } from './sockets/socketHandlers';
import { socketManager } from './sockets/socketManager';

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
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Initialize socket manager
    socketManager.initialize(io);

    // Socket authentication middleware
    io.use(socketAuthMiddleware);

    // Socket connection handling
    io.on('connection', handleSocketConnection);

    // Make io accessible in app context
    app.set('io', io);

    // Start server
    httpServer.listen(config.port, () => {
      console.log('═══════════════════════════════════════');
      console.log('🚀 Server running on port', config.port);
      console.log('📊 Environment:', config.nodeEnv);
      console.log('🔗 Health check:', `http://localhost:${config.port}/health`);
      console.log('📚 API base URL:', `http://localhost:${config.port}/api`);
      console.log('🔌 Socket.io enabled');
      if (config.nodeEnv === 'development') {
        console.log('🎯 Frontend URL:', config.frontendUrl);
      }
      console.log('═══════════════════════════════════════');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      
      // Close all socket connections
      io.close(() => {
        console.log('🔌 Socket.io closed');
      });

      httpServer.close(() => {
        console.log('💤 HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

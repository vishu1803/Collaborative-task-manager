import { connectDatabase } from './config/database';
import { config } from './config/env';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    console.log(`🚀 Server is ready to start on port ${config.port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    
    // We'll add Express server here in the next step
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

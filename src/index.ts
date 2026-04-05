import mongoose from 'mongoose';
import { createApp } from './app';
import { config, validateConfig } from './infrastructure/config';

/**
 * Application Entry Point
 * Connects to MongoDB and starts the Express server
 */
const start = async (): Promise<void> => {
  try {
    validateConfig();

    await mongoose.connect(config.mongodb.uri);
    console.log(' Connected to MongoDB');

    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(` Server running on port ${config.port} in ${config.env} mode`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.disconnect();
        console.log(' MongoDB disconnected');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

start();
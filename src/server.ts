// src/server.ts
import { app } from './app';
import { env } from './config/env.config';
import { Logger } from './utils/logger.utils';

try {
  app.listen();
  Logger.info(`
    ################################################
    🛡️  Server listening on port: ${env.PORT} 🛡️
    ################################################
  `);
} catch (error) {
  Logger.error('Failed to start server:', error);
  process.exit(1);
}
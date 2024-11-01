// src/utils/logger.utils.ts
import winston from 'winston';
import path from 'path';
import { env } from '../config';

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = env.LOG_FILE_PATH;
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

export const Logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'development' ? developmentFormat : logFormat,
    }),
    new winston.transports.File({
      filename: path.join(env.LOG_FILE_PATH, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(env.LOG_FILE_PATH, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add request logging in development
if (env.NODE_ENV === 'development') {
  Logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Handle uncaught exceptions and unhandled rejections
Logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(env.LOG_FILE_PATH, 'exceptions.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

process.on('unhandledRejection', (error: Error) => {
  Logger.error('Unhandled Rejection:', error);
});
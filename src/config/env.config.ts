// src/config/env.config.ts
import dotenv from 'dotenv';
import { cleanEnv, str, num, bool } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: num({ default: 3000 }),
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: str(),
  STRIPE_WEBHOOK_SECRET: str(),
  STRIPE_CURRENCY: str({ default: 'usd' }),
  
  // API Configuration
  API_PREFIX: str({ default: '/api' }),
  CORS_ORIGIN: str({ default: '*' }),
  
  // Security
  RATE_LIMIT_WINDOW: num({ default: 15 * 60 * 1000 }), // 15 minutes
  RATE_LIMIT_MAX: num({ default: 100 }), // requests per window
  
  // Features
  ENABLE_WEBHOOKS: bool({ default: true }),
  ENABLE_LOGGING: bool({ default: true }),

  // Email configuration
  SMTP_HOST: str({ default: 'smtp.gmail.com' }),
  SMTP_PORT: num({ default: 587 }),
  SMTP_SECURE: bool({ default: false }),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  EMAIL_FROM: str({ default: 'noreply@yourdomain.com' }),

   // Logging configuration
   LOG_LEVEL: str({ 
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'info'
  }),
  LOG_FILE_PATH: str({ default: 'logs' }),

  // Notification settings
  DISCORD_WEBHOOK_URL: str({ default: '' }),
  SLACK_WEBHOOK_URL: str({ default: '' }),
  ADMIN_EMAIL: str({ default: 'admin@example.com' }),
  
});

export default env;
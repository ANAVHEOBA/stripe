// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

// Import configurations
import { env } from './config/env.config';
import { stripe } from './config/stripe.config';

// Import routes
import routes from './routes';

// Import middlewares
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';

// Import utils
import { Logger } from './utils/logger.utils';
import { CustomError } from './utils/error.utils';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Rate limiting
    this.app.use(
      rateLimit({
        windowMs: env.RATE_LIMIT_WINDOW,
        max: env.RATE_LIMIT_MAX,
        message: {
          success: false,
          error: {
            message: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
            status: 429,
          },
        },
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    if (env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }
    this.app.use(loggingMiddleware);

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Handle 404
    this.app.use('*', (req, res, next) => {
      next(new CustomError('Route not found', 404, 'NOT_FOUND'));
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public listen(): void {
    try {
      // Verify Stripe configuration
      this.verifyStripeConfig();

      const server = this.app.listen(env.PORT, () => {
        Logger.info(
          `🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
        );
        Logger.info(`👉 http://localhost:${env.PORT}`);
      });

      // Handle unhandled promise rejections
      process.on('unhandledRejection', (err: Error) => {
        Logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
        server.close(() => {
          process.exit(1);
        });
      });

      // Handle uncaught exceptions
      process.on('uncaughtException', (err: Error) => {
        Logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
        process.exit(1);
      });

      // Handle SIGTERM
      process.on('SIGTERM', () => {
        Logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
        server.close(() => {
          Logger.info('💥 Process terminated!');
        });
      });
    } catch (error) {
      Logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async verifyStripeConfig(): Promise<void> {
    try {
      // Verify Stripe API key by making a test request
      await stripe.paymentMethods.list({ limit: 1 });
      Logger.info('✅ Stripe configuration verified');
    } catch (error) {
      Logger.error('❌ Invalid Stripe configuration:', error);
      throw new Error('Invalid Stripe configuration');
    }
  }
}

// Create and export app instance
const app = new App();

// Export for testing purposes
export { app };

// Start server if not in test mode
if (env.NODE_ENV !== 'test') {
  app.listen();
}

export default app.app;
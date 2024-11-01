// src/types/config.types.ts
export interface StripeConfig {
    secretKey: string;
    webhookSecret: string;
    currency: string;
    paymentMethods: string[];
    defaults: {
      paymentLink: {
        billingAddressCollection: 'auto' | 'required' | 'optional';
        allowPromotionCodes: boolean;
        automaticTax: {
          enabled: boolean;
        };
      };
    };
    urls: {
      success: string;
      cancel: string;
    };
  }
  
  export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    from: string;
    adminEmail: string;
  }
  
  export interface NotificationConfig {
    discord: {
      webhookUrl: string;
      enabled: boolean;
    };
    slack: {
      webhookUrl: string;
      enabled: boolean;
    };
    email: {
      enabled: boolean;
    };
  }
  
  export interface AppConfig {
    env: string;
    port: number;
    apiPrefix: string;
    corsOrigin: string | string[];
    rateLimitWindow: number;
    rateLimitMax: number;
    stripe: StripeConfig;
    email: EmailConfig;
    notifications: NotificationConfig;
  }
// src/templates/email.templates.ts
export * from './emails/payment-success.template';
export * from './emails/payment-failed.template';
export * from './emails/refund-confirmation.template';


import { paymentSuccessTemplate } from './emails/payment-success.template';
import { paymentFailedTemplate } from './emails/payment-failed.template';
import { refundConfirmationTemplate } from './emails/refund-confirmation.template';

export const EmailTemplates = {
  paymentSuccess: paymentSuccessTemplate,
  paymentFailed: paymentFailedTemplate,
  refundConfirmation: refundConfirmationTemplate,
};

export default EmailTemplates;
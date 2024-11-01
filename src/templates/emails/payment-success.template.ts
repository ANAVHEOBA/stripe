// src/templates/emails/payment-success.template.ts
import { baseTemplate } from './base.template';
import { CurrencyUtil } from '../../utils/currency.utils';

interface PaymentSuccessData {
  orderDetails: {
    orderId: string;
    amount: number;
    currency: string;
    items?: Array<{
      name: string;
      quantity: number;
      amount: number;
    }>;
    paymentDate: Date;
  };
}

export const paymentSuccessTemplate = (data: PaymentSuccessData) => {
  const { orderDetails } = data;
  const formattedAmount = CurrencyUtil.formatAmount(orderDetails.amount, orderDetails.currency);

  const content = `
    <div class="header">
        <h2>Payment Successful!</h2>
    </div>
    <div class="content">
        <p>Thank you for your payment. Your transaction has been completed successfully.</p>
        
        <div class="details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Amount Paid:</strong> ${formattedAmount}</p>
            <p><strong>Date:</strong> ${orderDetails.paymentDate.toLocaleDateString()}</p>
            
            ${orderDetails.items ? `
                <h4>Items</h4>
                <ul style="list-style: none; padding-left: 0;">
                    ${orderDetails.items.map(item => `
                        <li style="margin-bottom: 10px;">
                            ${item.name} x ${item.quantity} - 
                            ${CurrencyUtil.formatAmount(item.amount, orderDetails.currency)}
                        </li>
                    `).join('')}
                </ul>
            ` : ''}
        </div>
        
        <p>If you have any questions about your order, please don't hesitate to contact our support team.</p>
        
        <div style="margin-top: 20px; text-align: center;">
            <a href="/order-status/${orderDetails.orderId}" 
               class="button" 
               style="background-color: #28a745;">
                View Order Status
            </a>
        </div>
    </div>
  `;

  return {
    subject: `Payment Successful - Order #${orderDetails.orderId}`,
    html: baseTemplate(content)
  };
};
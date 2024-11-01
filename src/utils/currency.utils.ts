// src/utils/currency.utils.ts
export class CurrencyUtil {
    static formatAmount(amount: number, currency: string): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    }
  
    static convertToSmallestUnit(amount: number, currency: string): number {
      const multiplier = currency.toLowerCase() === 'jpy' ? 1 : 100;
      return Math.round(amount * multiplier);
    }
  
    static convertFromSmallestUnit(amount: number, currency: string): number {
      const divider = currency.toLowerCase() === 'jpy' ? 1 : 100;
      return amount / divider;
    }
  }
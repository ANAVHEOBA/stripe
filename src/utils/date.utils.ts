// src/utils/date.utils.ts
export class DateUtil {
    static now(): Date {
      return new Date();
    }
  
    static addDays(date: Date, days: number): Date {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
  
    static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
      // Simple format implementation - you might want to use a library like date-fns
      return date.toISOString().split('T')[0];
    }
  
    static isExpired(date: Date): boolean {
      return date < this.now();
    }
  
    static getExpiryDate(durationInDays: number): Date {
      return this.addDays(this.now(), durationInDays);
    }
  }
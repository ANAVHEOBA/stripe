export enum PlanType {
    BASIC = 'basic',
    PRO = 'pro',
    PREMIUM = 'premium'
  }
  
  export interface PropertyPlan {
    planType: PlanType;
    price: number;
    features: string[];
    duration: number; // in days (365 for annual)
  }
  
  // Changed from IProperty to Property
  export interface Property {
    id?: string;
    userId: string;
    title: string;
    description: string;
    address: string;
    planType: PlanType;
    planStartDate: Date;
    planEndDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreatePropertyDto {
    title: string;
    description: string;
    address: string;
    planType: PlanType;
  }
import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service';
import { PlanType } from '../types/property.types';
import { ResponseUtil } from '../utils/response.utils';
import { Logger } from '../utils/logger.utils';

export class PropertyController {
  static async createPaymentLink(
    req: Request<{}, {}, { planType: PlanType; propertyId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { planType, propertyId } = req.body;
      const userId = req.user.id; // bros this side u have to set up the user id from ur code, but may i try see whether i fit create am from here 

      const paymentLink = await PropertyService.createPaymentLink(
        planType,
        propertyId,
        userId
      );

      ResponseUtil.success(res, {
        paymentLink: paymentLink.url,
        planType,
        propertyId
      });
    } catch (error) {
      Logger.error('Error creating payment link:', error);
      next(error);
    }
  }

  static async checkPlanStatus(
    req: Request<{ propertyId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { propertyId } = req.params;
      const isActive = await PropertyService.checkPlanExpiration(propertyId);

      ResponseUtil.success(res, {
        isActive,
        propertyId
      });
    } catch (error) {
      Logger.error('Error checking plan status:', error);
      next(error);
    }
  }
}
import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { ValidationSchemas } from '../utils/validation.utils';

const router = Router();

router.post(
  '/payment-link',
  authMiddleware,
  validateRequest(ValidationSchemas.createPaymentLink),
  PropertyController.createPaymentLink
);

router.get(
  '/:propertyId/plan-status',
  authMiddleware,
  PropertyController.checkPlanStatus
);

export default router;
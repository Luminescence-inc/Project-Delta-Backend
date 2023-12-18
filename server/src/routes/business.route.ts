import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import passport from '../middleware/jwt.token.js';
import BusinessController from '../controllers/business.controller.js';
import { BusinessCreationRequestSchema } from '../schemas/businessCreationRequest.schema.js';
import { AuthRequestSchema } from '../schemas/request.schema.js';
import { BusinessSearchRequestSchema } from '../schemas/businessSearchRequest.js';

const router = Router();
const businessController = new BusinessController();

router.post(
  '/api/business_profile/create',
  passport.authenticate('jwt', { session: false }),
  validate(BusinessCreationRequestSchema),
  validate(AuthRequestSchema),
  businessController.createBusinessProfile
);

router.post(
  '/api/business_profile/update/:id',
  passport.authenticate('jwt', { session: false }),
  validate(BusinessCreationRequestSchema),
  validate(AuthRequestSchema),
  businessController.updateBusinessProfile
);

router.post(
  '/api/business_profile/search',
  validate(BusinessSearchRequestSchema),
  businessController.searchBusinessProfile
);

router.get(
  '/api/business_profile/list',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.listAllProfiles
);

router.get(
  '/api/business_profile/list/:id',
  businessController.getProfile
);

router.delete(
  '/api/business_profile/delete/:id',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.deleteProfile
);

// Both Customers and Business Owners have access to this endpoint
router.get(
  '/api/business_profile/categories',
  businessController.getBusinessCategories
);

router.get(
  '/api/business_profile/upload_signature',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.getUploadSignature
);

export default router;

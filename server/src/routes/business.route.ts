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
  '/business_profile/create',
  passport.authenticate('jwt', { session: false }),
  validate(BusinessCreationRequestSchema),
  validate(AuthRequestSchema),
  businessController.createBusinessProfile
);

router.post(
  '/business-profile/update/:id',
  passport.authenticate('jwt', { session: false }),
  validate(BusinessCreationRequestSchema),
  validate(AuthRequestSchema),
  businessController.updateBusinessProfile
);

// NEW
router.get('/businesses/search', businessController.searchBusinessProfileNew);

router.post('/business-profile/contact', businessController.contactSupport);

router.get(
  '/business-profile/list',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.listAllProfiles
);

router.get('/business-profile/list/:id', businessController.getProfile);

router.delete(
  '/business-profile/delete/:id',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.deleteProfile
);

// Both Customers and Business Owners have access to this endpoint
router.get('/business-profile/categories', businessController.getBusinessCategories);

router.get(
  '/business-profile/upload-signature',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.getUploadSignature
);

export default router;

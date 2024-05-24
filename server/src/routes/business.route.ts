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
  '/business_profile/update/:id',
  passport.authenticate('jwt', { session: false }),
  validate(BusinessCreationRequestSchema),
  validate(AuthRequestSchema),
  businessController.updateBusinessProfile
);

// OLD
router.post(
  '/business_profile/search',
  validate(BusinessSearchRequestSchema),
  businessController.searchBusinessProfileNew
);

// NEW
router.post('/businesses/search', businessController.searchBusinessProfileNew);

router.post('/business_profile/contact', businessController.contactSupport);

router.get(
  '/business_profile/list',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.listAllProfiles
);

router.get('/business_profile/list/:id', businessController.getProfile);

router.delete(
  '/business_profile/delete/:id',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.deleteProfile
);

// Both Customers and Business Owners have access to this endpoint
router.get('/business_profile/categories', businessController.getBusinessCategories);

router.get(
  '/business_profile/upload_signature',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  businessController.getUploadSignature
);

export default router;

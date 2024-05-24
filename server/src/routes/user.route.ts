import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import passport from '../middleware/jwt.token.js';
import { validate } from '../middleware/validate.js';
import { RegisterRequestSchema } from '../schemas/registerRequest.schema.js';
import { LoginRequestSchema } from '../schemas/loginRequest.schema.js';
import { AuthRequestSchema } from '../schemas/request.schema.js';
import { UpdateUserDetailsSchema } from '../schemas/updateUserDetails.schema.js';

const router = Router();
const userController = new UserController();

router.post('/user/register', validate(RegisterRequestSchema), userController.registerUser);

router.get('/user/details', passport.authenticate('jwt', { session: false }), userController.getUserDetails);

router.post(
  '/user/details/update',
  passport.authenticate('jwt', { session: false }),
  validate(UpdateUserDetailsSchema),
  userController.updateUserDetails
);

router.post('/user/login', validate(LoginRequestSchema), userController.loginUser);

router.get('/user/verify/:userId/:uniqueString', userController.verifyUserEmail);

router.post('/user/reset_password/:userId/:uniqueString', userController.resetUserPassword);

// router.get('/user/generate/verification/:userEmail', userController.generateUserVerificationLink)

router.get('/user/generate/forgot_password/:userEmail', userController.generateUserForgotPassLink);

router.get(
  '/user/validateToken',
  passport.authenticate('jwt', { session: false }),
  validate(AuthRequestSchema),
  (req: any, res: any) => {
    return res.status(200).send('authorized');
  }
);

router.get('/user/authenticated/:id', userController.isAuthenticated);

router.get('/user/logout/:id', userController.logOut);

export default router;

import { Router } from "express";
import UserController from "../controllers/user.controller";
import passport from "../middleware/jwt.token"
import { validate } from "../middleware/validate";
import { RegisterRequestSchema } from "../schemas/registerRequest.schema";
import { LoginRequestSchema } from "../schemas/loginRequest.schema";
import { AuthRequestSchema } from "../schemas/request.schema";

const router = Router();
const userController = new UserController();

router.post('/api/user/register', validate(RegisterRequestSchema), userController.registerUser)

router.post('/api/user/login', validate(LoginRequestSchema), userController.loginUser)

router.get('/api/user/verify/:userId/:uniqueString', userController.verifyUserEmail)

router.get('/api/user/generate/verification/:userEmail', userController.generateUserVerificationLink)

router.post('/api/user/reset_password/:userId/:uniqueString', userController.resetUserPassword)

router.get('/api/user/generate/forgot_password/:userEmail', userController.generateUserForgotPassLink)

router.get('/api/user/validateToken', passport.authenticate('jwt', {session: false}), validate(AuthRequestSchema), (req:any, res:any)=>{
    return res.status(200).send("authorized")
});


export default router;
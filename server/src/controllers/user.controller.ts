import { Response } from 'express';
import { hashSync, compareSync } from 'bcrypt';
import userService from '../services/user.service.js';
import { JwtPayload, UpdateUserDetailsRequest } from '../types/auth.js';
import { Role, VerificationType } from '@prisma/client';
import { z } from 'zod';
import { RegisterRequestSchema } from '../schemas/registerRequest.schema.js';
import { LoginRequestSchema } from '../schemas/loginRequest.schema.js';
import { getJwtToken, jwtTokenSecret, standardizeEmptyKeyValues } from '../utils/jwt.util.js';
import { v4 as uuidv4 } from 'uuid';
import { generateVerificationEmail, generateForgotPasswordEmail } from '../utils/email.util.js';

import jwtToken from 'jsonwebtoken';
import SendResponse from '../utils/response.util.js';

export default class UserController {
  private userService: userService;

  constructor() {
    this.userService = new userService();
  }
  // this is needed to register users
  registerUser = async (req: z.infer<typeof RegisterRequestSchema>, res: Response) => {
    const respond = new SendResponse(res);
    const { firstName, lastName, email, password } = req.body;

    try {
      const isEmailPresent = await this.userService.isEmailPresent(email.toLowerCase());

      if (isEmailPresent) {
        return respond
          .status(400)
          .success(false)
          .code(409)
          .desc(`User with email ${email.toLowerCase()} already exist`)
          .send();
      }

      const user = await this.userService.createUserDetails(
        firstName,
        lastName,
        email.toLowerCase(),
        hashSync(password, 10)
      ); // env: salt for password

      if (user.uuid) {
        // send verification email
        const uniqueString = uuidv4() + user.uuid;
        const hashedUniqueString = hashSync(uniqueString, 10); // env: salt for verification

        const newVerification = await this.userService.createUserVerification(
          user.uuid,
          hashedUniqueString,
          Date.now(),
          Date.now() + 21600000,
          VerificationType.EMAIL
        );

        if (newVerification.uuid) {
          await generateVerificationEmail(user.uuid, user.email, uniqueString, user.firstName)
            .then(() => console.info(`Verification email sent to - ${user.email}`))
            .catch(err => console.error(`Verification email failed with error message - ${err}`));

          // Generate and save token
          const payload: JwtPayload = {
            id: user?.uuid as string,
            firstName: user?.firstName as string,
            lastName: user?.lastName as string,
            email: user?.email as string,
            role: user?.role as Role,
            verified: user?.verified as Boolean,
          };
          const token = `Bearer ${getJwtToken(payload)}`;
          await this.userService.updatedUserTokens(user.uuid, [token.split(' ')[1]]);

          return respond
            .status(200)
            .success(true)
            .code(200)
            .desc('successful Signed Up!')
            .responseData({ token })
            .send();
        }
      }
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  getUserDetails = async (req: any, res: Response) => {
    const respond = new SendResponse(res);
    const user: JwtPayload = req.user as JwtPayload;
    try {
      const userDetails = await this.userService.findUserById(user.id);
      return respond.status(200).success(true).code(200).desc('User Details').responseData({ userDetails }).send();
    } catch (error) {
      console.error(error);
    }
  };

  updateUserDetails = async (req: any, res: Response) => {
    const respond = new SendResponse(res);
    const updatedDetails: UpdateUserDetailsRequest = req.body;
    const user: JwtPayload = req.user as JwtPayload;
    const filteredDetails = standardizeEmptyKeyValues(updatedDetails);

    try {
      const updatedUser = await this.userService.updateUserDetails(
        user.id,
        filteredDetails.firstName,
        filteredDetails.lastName,
        filteredDetails.password ? hashSync(filteredDetails.password, 10) : null
      ); // env: salt for password

      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc('User Details updated')
        .responseData({ updatedUser })
        .send();
    } catch (error) {
      console.error(error);
    }
  };

  loginUser = async (req: z.infer<typeof LoginRequestSchema>, res: Response) => {
    const respond = new SendResponse(res);
    const { email, password } = req.body;

    try {
      const isEmailPresent = await this.userService.isEmailPresent(email.toLowerCase());

      if (!isEmailPresent) {
        return respond.status(404).success(false).code(404).desc(`email does not exist`).send();
      }

      const userDetails = await this.userService.findUserByEmail(email.toLowerCase());

      if (userDetails?.password) {
        const userpassword = userDetails?.password as string;

        if (!compareSync(password, userpassword)) {
          return respond.status(401).success(false).code(401).desc(`Incorrect password`).send();
        } else {
          // Generate tokenPayload
          const payload: JwtPayload = {
            id: userDetails?.uuid as string,
            firstName: userDetails?.firstName as string,
            lastName: userDetails?.lastName as string,
            email: userDetails?.email as string,
            role: userDetails?.role as Role,
            verified: userDetails?.verified as Boolean,
          };

          const token = `Bearer ${getJwtToken(payload)}`;
          const usersTokens = userDetails.token;
          await this.userService.updatedUserTokens(userDetails.uuid, [...usersTokens, token.split(' ')[1]]);

          // If account is not verified and Email verification link has expired, then send new email verification link
          if (!userDetails?.verified) {
            const uniqueString = uuidv4() + userDetails.uuid;
            const hashedUniqueString = hashSync(uniqueString, 10); // env: salt for verification
            const previousEmailVerificationLink = await this.userService.findVerificationLinkByUserId(
              userDetails.uuid,
              VerificationType.EMAIL
            );

            if (previousEmailVerificationLink) {
              if (previousEmailVerificationLink.expiresUtc < new Date()) {
                // Verification link has expired. Generate new link
                const newVerification = await this.userService.createUserVerification(
                  userDetails.uuid,
                  hashedUniqueString,
                  Date.now(),
                  Date.now() + 21600000,
                  VerificationType.EMAIL
                );
                if (newVerification) {
                  await generateVerificationEmail(
                    userDetails.uuid,
                    userDetails.email,
                    uniqueString,
                    userDetails.firstName
                  )
                    .then(() => console.info(`Verification email sent to - ${userDetails.email}`))
                    .catch(err => console.error(`Verification email failed with error message - ${err}`));
                }
              }
            } else {
              // Can't find verification link. Generate new one
              const newVerification = await this.userService.createUserVerification(
                userDetails.uuid,
                hashedUniqueString,
                Date.now(),
                Date.now() + 21600000,
                VerificationType.EMAIL
              );
              if (newVerification) {
                await generateVerificationEmail(
                  userDetails.uuid,
                  userDetails.email,
                  uniqueString,
                  userDetails.firstName
                )
                  .then(() => console.info(`Verification email sent to - ${userDetails.email}`))
                  .catch(err => console.error(`Verification email failed with error message - ${err}`));
              }
            }
          }

          return respond.status(200).success(true).code(200).desc('successful LogIn').responseData({ token }).send();
        }
      }
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  verifyUserEmail = async (req: any, res: Response) => {
    const respond = new SendResponse(res);
    const { userId, uniqueString } = req.params;
    try {
      const verificationLinks = await this.userService.findVerificationLinkByUserId(userId, VerificationType.EMAIL);

      if (!verificationLinks) {
        console.log(
          'Account has been verified or link has expired. logIn to generate new verification link or Check your email for a new verification link'
        );
        return respond
          .status(400)
          .success(false)
          .code(499)
          .desc(
            'Account has been verified or link has expired. logIn to generate new verification link or Check your email for a new verification link'
          )
          .send();
      } else {
        const { expiresUtc, uniqueString: dbHashedUniqueString } = verificationLinks;
        if (expiresUtc < new Date()) {
          // record has expired hence delete record
          await this.userService.deleteVerificationLink(dbHashedUniqueString);
          return respond
            .status(400)
            .success(false)
            .code(499)
            .desc(
              'Verification link has expired. logIn to generate new verification link or Check your email for a new verification link'
            )
            .send();
        }

        if (compareSync(uniqueString, dbHashedUniqueString)) {
          const user = await this.userService.verifyUserById(userId);
          if (user) {
            await this.userService.deleteVerificationLink(dbHashedUniqueString);
            return respond.status(200).success(true).code(200).desc('Account has been verified.').send();
          }
        } else {
          return respond.status(400).success(false).code(499).desc('Verification link Is invalid').send();
        }
      }
    } catch (error) {
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  generateUserVerificationOrPassLink = async (req: any, res: Response, type: string) => {
    const respond = new SendResponse(res);
    const { userEmail } = req.params;

    try {
      const emailPresent = await this.userService.isEmailPresent(userEmail.toLowerCase());

      if (!emailPresent) {
        return respond
          .status(404)
          .success(false)
          .code(404)
          .desc(`email {${userEmail.toLowerCase()}} does not exist`)
          .send();
      }

      const userDetails = await this.userService.findUserByEmail(userEmail.toLowerCase());

      if (userDetails) {
        const id = userDetails?.uuid as string;
        const uniqueString = uuidv4() + id;
        const hashedUniqueString = hashSync(uniqueString, 10); // env: salt for verification
        const verificationType = type === 'verification' ? VerificationType.EMAIL : VerificationType.PASSWORD;
        const newVerification = await this.userService.createUserVerification(
          id,
          hashedUniqueString,
          Date.now(),
          Date.now() + 21600000,
          verificationType
        );

        if (newVerification) {
          if (type === 'verification') {
            await generateVerificationEmail(userDetails.uuid, userDetails.email, uniqueString, userDetails.firstName)
              .then(() => {
                console.info(`Verification email sent to - ${userDetails.email}`);
                return respond
                  .status(200)
                  .success(true)
                  .code(200)
                  .desc(`Verification email sent to: ${userDetails.email}`)
                  .send();
              })
              .catch(err => console.error(`Verification email failed with error message - ${err}`));
          }
          if (type === 'password') {
            await generateForgotPasswordEmail(userDetails.uuid, userDetails.email, uniqueString, userDetails.firstName)
              .then(() => {
                console.info(`Verification email sent to - ${userDetails.email}`);
                return respond
                  .status(200)
                  .success(true)
                  .code(200)
                  .desc(`Verification email sent to: ${userDetails.email}`)
                  .send();
              })
              .catch(err => console.error(`Verification email failed with error message - ${err}`));
          }
        } else {
          return respond
            .status(400)
            .success(false)
            .code(400)
            .desc("Verification email failed. Email link wasn't generted")
            .send();
        }
      }
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  generateUserVerificationLink = async (req: any, res: Response) => {
    return this.generateUserVerificationOrPassLink(req, res, 'verification');
  };

  generateUserForgotPassLink = async (req: any, res: Response) => {
    return this.generateUserVerificationOrPassLink(req, res, 'password');
  };

  resetUserPassword = async (req: any, res: Response) => {
    const respond = new SendResponse(res);
    const { userId, uniqueString } = req.params;
    const { newPassword } = req.body;

    try {
      const verificationLinks = await this.userService.findVerificationLinkByUserId(userId, VerificationType.PASSWORD);

      if (!verificationLinks) {
        return respond.status(400).success(false).code(499).desc('Reset Password link has expired or Invalid').send();
      } else {
        const { expiresUtc, uniqueString: dbHashedUniqueString } = verificationLinks;
        if (expiresUtc < new Date()) {
          // record has expired hence delete record
          await this.userService.deleteVerificationLink(dbHashedUniqueString);
          return respond.status(400).success(false).code(499).desc('Verification link has expired').send();
        }

        if (compareSync(uniqueString, dbHashedUniqueString)) {
          await this.userService.deleteVerificationLink(dbHashedUniqueString);
          const user = await this.userService.updatedUserPasswordById(userId, hashSync(newPassword, 10));

          if (user) {
            return respond.status(200).success(true).code(200).desc('Password Reset Success').send();
          } else {
            return respond.status(400).success(false).code(400).desc('Error occured').send();
          }
        } else {
          return respond.status(400).success(false).code(499).desc('Verification link Is invalid').send();
        }
      }
    } catch (error) {
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  isAuthenticated = async (req: any, res: Response) => {
    const respond = new SendResponse(res);
    const { id } = req.params;
    const authorizationHeader = req.headers.authorization;
    try {
      const token = authorizationHeader.split(' ')[1];
      const decodedToken = jwtToken.verify(token, jwtTokenSecret) as jwtToken.JwtPayload;
      const tokens = await this.userService.findUserTokensById(id);

      const matchedToken = tokens?.token.find(t => {
        try {
          const decodedDbToken = jwtToken.verify(t, jwtTokenSecret) as jwtToken.JwtPayload;
          return JSON.stringify(decodedToken) === JSON.stringify(decodedDbToken) ? true : false;
        } catch (error) {
          return false;
        }
      });

      if (!matchedToken) {
        return respond.status(400).success(false).code(400).desc('Authentication failed Token not recognised').send();
      }

      if (matchedToken) {
        const currentTimestamp = Math.floor(Date.now() / 1000);

        // remove expired tokens and update user tokens
        const activeTokens = tokens?.token.filter(t => {
          try {
            const decToken = jwtToken.verify(t, jwtTokenSecret) as jwtToken.JwtPayload;
            return decToken.exp && currentTimestamp < decToken.exp ? true : false;
          } catch (error) {
            return false;
          }
        }) as string[];

        this.userService.updatedUserTokens(id, activeTokens);

        // validate current token
        if (decodedToken.exp && currentTimestamp > decodedToken.exp) {
          return respond.status(400).success(false).code(400).desc('Token has expired').send();
        } else {
          return respond.status(200).success(true).code(200).desc('User is Authenticated').send();
        }
      }
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  logOut = async (req: any, res: Response) => {
    const respond = new SendResponse(res);
    const { id } = req.params;
    const authorizationHeader = req.headers.authorization;
    try {
      const token = authorizationHeader.split(' ')[1];
      const decodedToken = jwtToken.verify(token, jwtTokenSecret) as jwtToken.JwtPayload;
      const tokens = await this.userService.findUserTokensById(id);

      // remove current token
      const activeTokens = tokens?.token.filter(t => {
        const decToken = jwtToken.verify(t, jwtTokenSecret) as jwtToken.JwtPayload;
        JSON.stringify(decodedToken) !== JSON.stringify(decToken) ? true : false;
      }) as string[];

      const updatedToken = await this.userService.updatedUserTokens(id, activeTokens);
      return respond.status(200).success(true).code(200).desc('User Logged Out').send();
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };
}

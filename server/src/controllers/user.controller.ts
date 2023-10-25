import { Response } from "express";
import { hashSync, compareSync } from "bcrypt";
import userService from "../services/user.service";
import { JwtPayload } from "../types/auth";
import { Role } from "@prisma/client";
import { z } from "zod";
import { RegisterRequestSchema } from "../schemas/registerRequest.schema";
import { LoginRequestSchema } from "../schemas/loginRequest.schema";
import { getJwtToken } from "../utils/jwt.util";
import { v4 as uuidv4 } from 'uuid';
import { generateVerificationEmail, generateForgotPasswordEmail } from "@src/utils/email.util";


export default class UserController {
    private userService: userService;
  
    constructor() {
      this.userService = new userService();
    }

    registerUser = async(req: z.infer<typeof RegisterRequestSchema>, res: Response)=>{
        const {firstName, lastName, email, password} = req.body;
        console.log(" req.body: ", req.body)

        const emailPresent = this.userService.isEmailPresent(email);

        emailPresent.then((emailStatus)=>{
            if(emailStatus){
                return res.status(400).send({success: false, message:`User with email ${email} already exist`}) 
            }

            const user = this.userService.createUserDetails(firstName, lastName, email, hashSync(password,10)); // env: salt for password
            user.then((data)=>{
                // send verification email
                const uniqueString = uuidv4() + data.uuid;
                const hashedUniqueString  =  hashSync(uniqueString, 10); // env: salt for verification

                const newVerification =  this.userService.createUserVerification(data.uuid, hashedUniqueString, Date.now(), Date.now()+21600000);

                newVerification.then(()=>{
                    generateVerificationEmail(data.uuid, data.email, uniqueString, Date.now()+21600000)
                    .then(()=>{
                        return res.status(200).send({
                            success: true,
                            message: `Verification email sent to: ${data.email}`
                        })
                    })
                    .catch((err)=>{
                        return res.status(400).send({success: false, message:`Verification email failed with error message - ${err}`})
                    })
                }).catch((err)=>{
                    res.status(400).send({success: false, message:`Verification email failed with error message - ${err}`})
                })
            }).catch((err)=>{
                res.status(400).send({success: false, message:`Registeration failed with error message - ${err}`})
            })       
        }).catch((err)=>{return res.status(400).send({success: false, message: err})})
    }

    loginUser = async(req: z.infer<typeof LoginRequestSchema>, res: Response)=>{
        const {email, password} = req.body;
        const emailPresent = this.userService.isEmailPresent(email);
        
        emailPresent.then((emailStatus)=>{

            if(!emailStatus){
                return res.status(400).send({success: false, message:`email {${email}} does not exist`})
            }

            const userDetails = this.userService.findUserByEmail(email);

            userDetails.then((user)=>{
                const userpassword = user?.password as string;

                if(!compareSync(password, userpassword)){
                    return res.status(401).send({success: false, message:`Incorrect password`});
                }else{
                    // Generate tokenPayload
                    const payload: JwtPayload = {
                        id: user?.uuid as string,
                        firstName: user?.firstName as string,
                        lastName: user?.lastName as string,
                        email: user?.email as string,
                        role: user?.role as Role,
                        verified: user?.verified as Boolean
                    }

                    return res.status(200).send({
                        success: true,
                        token: `Bearer ${getJwtToken(payload)}`
                    })
                }
                
            }).catch((err)=>{return res.status(400).send({success: false, message: err})})   

        }).catch((err)=>{return res.status(400).send({success: false, message: err})})

    }

    verifyUserEmail = async(req: any, res: Response)=>{
        const {userId, uniqueString} = req.params;
        let userVerified = false;

        const verificationLinks = this.userService.findVerificationLinkByUserId(userId);

        verificationLinks
        .then((links)=>{
            if(links.length > 0){
                links.forEach(link => {
                    const {expiresUtc, uniqueString: dbHashedUniqueString} = link;
                    if(expiresUtc < new Date()){
                        // record has expired hence delete record
                        this.userService.deleteVerificationLink(dbHashedUniqueString);
                    }else{
                        if(compareSync(uniqueString, dbHashedUniqueString)){
                            userVerified=true;
                            this.userService.verifyUserById(userId)
                            .then(()=>{
                                // User has been verified. Delete verification record
                                this.userService.deleteVerificationLink(dbHashedUniqueString);
                            });
                        }
                    }
                });

                if(userVerified){
                    return res.status(200).send({success: true, message: "Account has been verified."})
                }else{
                    return res.status(401).send({success: false, message:"Verification Link has expired or Invalid verification Link."});
                }

            }else{
                return res.status(400).send({success: false, message: "Account has been verified or it doesn't exist or link has expired. Sign up or log in or generate new verification link"})
            }
        })
        .catch((err)=>{return res.status(400).send({success: false, message: err})})
    }

    generateUserVerificationOrPassLink = async(req: any, res: Response, type: string)=> {
        const {userEmail} = req.params;

        const emailPresent = this.userService.isEmailPresent(userEmail);

        emailPresent.then((emailStatus)=>{
            if(!emailStatus){
                return res.status(400).send({success: false, message:`email {${userEmail}} does not exist`})
            }

            const userDetails = this.userService.findUserByEmail(userEmail);

            userDetails.then((user)=>{
                const email = user?.email as string;
                const id = user?.uuid as string;
                const uniqueString = uuidv4() + id;
                const hashedUniqueString  =  hashSync(uniqueString, 10); // env: salt for verification

                const newVerification =  this.userService.createUserVerification(id, hashedUniqueString, Date.now(), Date.now()+21600000);

                // send verification email
                newVerification.then(()=>{
                    if(type==="verification"){
                        generateVerificationEmail(id, email, uniqueString, Date.now()+21600000)
                        .then(()=>{
                            return res.status(200).send({
                                success: true,
                                message: `Verification email sent to: ${email}`
                            })
                        })
                        .catch((err)=>{
                            return res.status(400).send({success: false, message:`Verification email failed with error message - ${err}`})
                        })
                    }
                    if(type==="password"){
                        generateForgotPasswordEmail(id, email, uniqueString, Date.now()+21600000)
                        .then(()=>{
                            return res.status(200).send({
                                success: true,
                                message: `Verification email sent to: ${email}`
                            })
                        })
                        .catch((err)=>{
                            return res.status(400).send({success: false, message:`Verification email failed with error message - ${err}`})
                        })
                    }
                }).catch((err)=>{
                    res.status(400).send({success: false, message:`Verification email failed with error message - ${err}`})
                })
                
            }).catch((err)=>{return res.status(400).send({success: false, message: err})})  

        }).catch((err)=>{return res.status(400).send({success: false, message: err})})

    }

    generateUserVerificationLink = async(req: any, res: Response) => {
        return this.generateUserVerificationOrPassLink(req, res, "verification");
    }

    generateUserForgotPassLink = async(req: any, res: Response) => {
        return this.generateUserVerificationOrPassLink(req, res, "password");
    }

    resetUserPassword = async(req: any, res: Response) => {
        const {userId, uniqueString} = req.params;
        const {newPassword} = req.body;

        const verificationLinks = this.userService.findVerificationLinkByUserId(userId);

        try {
            verificationLinks
            .then((links)=>{
                if(links.length > 0){
                    links.forEach(link => {
                        const {expiresUtc, uniqueString: dbHashedUniqueString} = link;
                        if(expiresUtc < new Date()){
                            // record has expired hence delete record
                            this.userService.deleteVerificationLink(dbHashedUniqueString);
                        }else{
                            if(compareSync(uniqueString, dbHashedUniqueString)){
                                // User has been verified. Delete verification record
                                this.userService.deleteVerificationLink(dbHashedUniqueString);

                                // reset password
                                const user = this.userService.updatedUserPasswordById(userId, hashSync(newPassword,10))
                                user.then(()=>{
                                    return res.status(200).send({success: false, message: "Password Reset Success"})
                                }).catch(()=>{res.status(400).send({success: false, message: "Error in resetting password"})})
                            }
                        }
                    });

                }else{
                    return res.status(400).send({success: false, message: "Reset Password link has expired or Invalid"})
                }
            }).catch((err)=>{return res.status(400).send({success: false, message: err})})
        } catch (error) {
            console.log(error);
        }
    }

}

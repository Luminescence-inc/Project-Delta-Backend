import { Role, VerificationType } from "@prisma/client";
import prisma from "../utils/prisma.client";

export default class userService {
    static createUserVerification: any;
    
    async createUserDetails(firstName: string, lastName: string, email: string, password: string){
        return await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password
            }
        });
    }

    async createUserVerification(useruuid: string, hashedUniqueString: string, createdUtc: number, expiresUtc: number, verificationType: VerificationType){
        const verificationLinkExist = await this.findVerificationLinkByUserId(useruuid, verificationType)

        if(verificationLinkExist){
            return await prisma.user_verification.update({
                where: {uuid: verificationLinkExist.uuid},
                data: {uniqueString: hashedUniqueString, 
                       createdUtc: new Date(createdUtc), 
                       expiresUtc: new Date(expiresUtc)}
            })
        }else{
            return await prisma.user_verification.create({
                data: {
                    useruuid,
                    uniqueString: hashedUniqueString,
                    type: verificationType,
                    createdUtc: new Date(createdUtc),
                    expiresUtc: new Date(expiresUtc)
                }
            })
        }
    }

    async isEmailPresent(email: string): Promise<boolean>{
        const findEmail = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if(findEmail?.uuid){
            return true;
        }
        return false;
    }

    async findUserByEmail(email: string) {
        return await prisma.user.findFirst({
            where: {
                email
            }
        })
    }

    async verifyUserById(useruuid: string) {
        return await prisma.user.update({
            where: {uuid: useruuid},
            data: {verified: true}
        })
    }

    async updatedUserPasswordById(useruuid: string, password: string) {
        return await prisma.user.update({
            where: {uuid: useruuid},
            data: {password}
        })
    }

    async findVerificationLinkByUserId(useruuid: string, type: VerificationType){
        return await prisma.user_verification.findFirst({
            where: {
                useruuid,
                type
            }
        })
    }

    async deleteVerificationLink(uniqueString: string){
        return await prisma.user_verification.delete({
            where: {
                uniqueString
            }
        })
    }

    async findUserTokensById(uuid: string) {
        return await prisma.user.findFirst({
            where: {
                uuid
            },
            select: {
                token: true
            }
        })
    }

    async updatedUserTokens(useruuid: string, token: string[]) {
        return await prisma.user.update({
            where: {uuid: useruuid},
            data: {token}
        })
    }

    async updatUserRole(useruuid: string, role: Role) {
        return await prisma.user.update({
            where: {uuid: useruuid},
            data: {role}
        })
    }

}
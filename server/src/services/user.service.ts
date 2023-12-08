import prisma from '../utils/prisma.client.js';

export default class userService {
  static createUserVerification: any;

  async createUserDetails(firstName: string, lastName: string, email: string, password: string) {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
      },
    });
    return user;
  }

  async createUserVerification(useruuid: string, hashedUniqueString: string, createdUtc: number, expiresUtc: number) {
    return await prisma.user_verification.create({
      data: {
        useruuid,
        uniqueString: hashedUniqueString,
        createdUtc: new Date(createdUtc),
        expiresUtc: new Date(expiresUtc),
      },
    });
  }

  async isEmailPresent(email: string): Promise<boolean> {
    const findEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (findEmail?.uuid) {
      return true;
    }
    return false;
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  async verifyUserById(useruuid: string) {
    return await prisma.user.update({
      where: { uuid: useruuid },
      data: { verified: true },
    });
  }

  async updatedUserPasswordById(useruuid: string, password: string) {
    return await prisma.user.update({
      where: { uuid: useruuid },
      data: { password },
    });
  }

  async findVerificationLinkByUserId(useruuid: string) {
    return await prisma.user_verification.findMany({
      where: {
        useruuid,
      },
    });
  }

  async deleteVerificationLink(uniqueString: string) {
    return await prisma.user_verification.delete({
      where: {
        uniqueString,
      },
    });
  }
}

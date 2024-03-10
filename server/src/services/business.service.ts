import { BusinessCreationBody } from '@src/types/business';
import prisma from '../utils/prisma.client.js';

export default class businessService {
  async createBusinessProfile(userUuid: string, profileBody: BusinessCreationBody) {
    return await prisma.business_profiles.create({
      data: {
        userUuid: userUuid,
        ...profileBody,
      },
      include: {
        businessCategory: {
          select: {
            uuid: true,
            description: true,
          },
        },
      },
    });
  }

  async updateBusinessProfileById(uuid: string, userUuid: string, profileBody: BusinessCreationBody) {
    return await prisma.business_profiles.update({
      where: { uuid, userUuid },
      data: { ...profileBody, modifiedUtc: new Date() },
      include: {
        businessCategory: {
          select: {
            uuid: true,
            description: true,
          },
        },
      },
    });
  }

  async findAllBusinessProfileById(userUuid: string) {
    return await prisma.business_profiles.findMany({
      where: {
        userUuid,
      },
      include: {
        businessCategory: {
          select: {
            uuid: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdUtc: 'asc',
      },
    });
  }

  async searchBusinessProfile(where: any, take: number, skip: number, orderBy: any) {
    return await prisma.business_profiles.findMany({
      where,
      take,
      skip,
      orderBy,
    });
  }

  async searchBusinessProfileCount(where: any) {
    return await prisma.business_profiles.count({
      where,
    });
  }

  async findAllBusinessCategories() {
    return await prisma.business_categories.findMany({
      select: {
        uuid: true,
        description: true,
      },
    });
  }

  async findBusinessProfileById(uuid: string) {
    return await prisma.business_profiles.findFirst({
      where: {
        uuid
      },
      include: {
        businessCategory: {
          select: {
            uuid: true,
            description: true,
          },
        },
      },
    });
  }

  async deleteBusinessProfileById(uuid: string, userUuid: string) {
    return await prisma.business_profiles.delete({
      where: {
        uuid,
        userUuid,
      },
      include: {
        businessCategory: {
          select: {
            uuid: true,
            description: true,
          },
        },
      },
    });
  }
}

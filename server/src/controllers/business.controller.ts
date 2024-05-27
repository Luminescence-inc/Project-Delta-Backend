import businessService from '../services/business.service.js';
import { BusinessCreationBody, BusinessSearchRequestBody } from '../types/business.js';
import { Request, Response } from 'express';
import { JwtPayload } from '../types/auth.js';
import { removeEmptyOrNullKeyValues, standardizeEmptyKeyValues } from '../utils/jwt.util.js';
import SendResponse from '../utils/response.util.js';
import { Role } from '@prisma/client';
import userService from '../services/user.service.js';
import { BusinessProfileFilterField } from '../enums/business.enum.js';
import { ConfigOptions, v2 as cloudinary } from 'cloudinary';
import { generateSupportEmail } from '../utils/email.util.js';
import Env from '@src/ config/env.js';
import prisma from '@src/utils/prisma.client.js';

type Empty = null | undefined | '';

interface IConstructWhereClause {
  cn: string | Empty;
  cty?: string | Empty;
  st?: string | Empty;
  query?: string | Empty;
  cat?: string | Empty;
}

interface IConstructPaginationProperties {
  page: string | Empty;
  limit: string | Empty;
  sortBy?: string | Empty;
  sortDirection?: string | Empty;
}

type IWhereClause = {
  [key: string]: {
    in?: string[];
    contains?: string;
  };
};

type KeyofIConstructWhereClause = keyof IConstructWhereClause;

export default class BusinessController {
  private businessService: businessService;
  private userService: userService;
  private cloudinaryConfig: ConfigOptions;

  constructor() {
    this.businessService = new businessService();
    this.userService = new userService();

    this.cloudinaryConfig = cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
      secure: true,
    });
  }
  // this is used for searching profile
  searchBusinessProfile = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    const searchBody: BusinessSearchRequestBody = req.body;
    try {
      const sortBy = searchBody.paging.sortBy;
      const sortDirection = searchBody.paging.sortDirection;
      const page = searchBody.paging.page;
      const take = searchBody.paging.limit;
      const skip = (page - 1) * take;

      const orderByClause: any = {};
      const whereClause: any = {};

      //Build orderByClause
      if (sortBy && sortDirection) {
        orderByClause[sortBy] = sortDirection;
      }

      //Build whereClause
      searchBody.search.filters.forEach(element => {
        switch (element.targetFieldName) {
          case BusinessProfileFilterField.BusinessCategoryUuid:
            if (element.values.length > 0) {
              whereClause[BusinessProfileFilterField.BusinessCategoryUuid] = {
                in: element.values as string[],
              };
            }
            break;
          case BusinessProfileFilterField.Country:
            if (element.values.length > 0) {
              whereClause[BusinessProfileFilterField.Country] = {
                in: element.values as string[],
              };
            }
            break;
          case BusinessProfileFilterField.StateAndProvince:
            if (element.values.length > 0) {
              whereClause[BusinessProfileFilterField.StateAndProvince] = {
                in: element.values as string[],
              };
            }
            break;
          case BusinessProfileFilterField.City:
            if (element.values.length > 0) {
              whereClause[BusinessProfileFilterField.City] = {
                in: element.values as string[],
              };
            }
            break;
        }
      });

      const total = await this.businessService.searchBusinessProfileCount(whereClause);
      const data = await this.businessService.searchBusinessProfile(whereClause, take, skip, orderByClause);
      const allBusinessProfile = {
        data,
        total,
        page: page,
        limit: take,
        totalPages: Math.ceil(total / take),
      };

      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc('searched Business Profiles')
        .responseData({ businessProfiles: allBusinessProfile })
        .send();
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  // construct where clause for prisma
  private async constructWhereClause(params: IConstructWhereClause): Promise<IWhereClause> {
    const whereClause: IWhereClause = {};
    const keyReplacements = {
      cn: 'country',
      cty: 'city',
      st: 'stateAndProvince',
      query: 'name',
      cat: 'businessCategoryUuid',
    };

    const capitalizeFirstLetter = (str: string): string =>
      str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const createInClause = (key: string, values: string[]): { [key: string]: { in: string[] } } => ({
      [key]: {
        in: values,
      },
    });

    const createContainsClause = (
      key: string,
      value: string
    ): { [key: string]: { contains: string; mode: 'insensitive' } } => ({
      [key]: { contains: value, mode: 'insensitive' },
    });

    for (const key of Object.keys(params)) {
      if (!params[key as keyof IConstructWhereClause]) continue;

      const shouldCapitalize = ['cn', 'cty', 'st'].includes(key);
      const isCategoryKey = key === 'cat';
      let categories: string[] = [];

      if (isCategoryKey) {
        categories = await this.businessService.fetchCategoriesByName(params.cat as string);
      }

      if (categories.length === 0 && isCategoryKey) {
        delete params[key as keyof IConstructWhereClause];
        continue;
      }

      const clauseProps = isCategoryKey
        ? createInClause(
            keyReplacements[key] ?? key,
            shouldCapitalize
              ? [capitalizeFirstLetter(params[key as keyof IConstructWhereClause] as string)]
              : categories.length > 0
                ? categories
                : [params[key as keyof IConstructWhereClause] as string]
          )
        : createContainsClause(
            keyReplacements[key as keyof IConstructWhereClause] ?? key,
            shouldCapitalize
              ? capitalizeFirstLetter(params[key as keyof IConstructWhereClause] as string)
              : (params[key as keyof IConstructWhereClause] as string)
          );

      // @ts-expect-error
      whereClause[keyReplacements[key] ?? key] = clauseProps[keyReplacements[key] ?? key];
    }

    return whereClause;
  }

  // construct pagination properties
  private constructPaginationProperties(params: IConstructPaginationProperties) {
    const defaultLimit = 10;
    const defaultPage = 1;
    const defaultSortBy = 'createdUtc';
    const defaultSortDirection = 'desc';

    let properties: { take: number; skip: number; orderBy: { [key: string]: 'asc' | 'desc' } } = {
      take: defaultLimit,
      skip: 0,
      orderBy: {
        [defaultSortBy]: defaultSortDirection as 'asc' | 'desc',
      },
    };

    for (const key of Object.keys(params)) {
      if (
        params[key as keyof IConstructPaginationProperties] ||
        typeof params[key as keyof IConstructPaginationProperties] !== 'undefined' ||
        params[key as keyof IConstructPaginationProperties] !== null
      ) {
        switch (key) {
          case 'page':
            properties.skip =
              (Number(params.page ?? defaultPage) - 1) * (params.limit ? Number(params.limit) : defaultLimit);
            break;
          case 'limit':
            properties.take = Number(params.limit ? params.limit : defaultLimit);
            break;
          case 'sortBy':
            properties.orderBy = {
              [(params.sortBy as string) ?? defaultSortBy]:
                (params.sortDirection as 'asc' | 'desc') ?? defaultSortDirection,
            };
            break;
        }
      }
    }
    return properties;
  }

  // NEW
  searchBusinessProfileNew = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    try {
      const _url = `${Env.API_URL}${req.url}`;
      const urlObj = new URL(_url).searchParams;

      const sanitizeParam = (param: string | null) => {
        if (!param) return param;
        return param.replace(/[^a-zA-Z0-9\s]/g, '');
      };

      const cn = sanitizeParam(urlObj.get('cn'));
      const cty = sanitizeParam(urlObj.get('cty'));
      const st = sanitizeParam(urlObj.get('st'));
      const query = sanitizeParam(urlObj.get('query'));
      const cat = sanitizeParam(urlObj.get('cat'));
      const page = sanitizeParam(urlObj.get('page'));
      const limit = sanitizeParam(urlObj.get('limit'));
      const sortBy = sanitizeParam(urlObj.get('sortBy') ?? 'name');
      const sortDirection = sanitizeParam(urlObj.get('sortDirection'));

      const whereClause = await this.constructWhereClause({ cn, cty, st, query, cat });
      const paginationProperties = this.constructPaginationProperties({ page, limit, sortBy, sortDirection });

      console.log(whereClause, paginationProperties);

      const profiles = await prisma.business_profiles.findMany({
        where: {
          OR: [
            {
              ...whereClause,
            },
          ],
        },
        ...paginationProperties,
      });

      // Get the total count of profiles matching the criteria
      const totalProfilesCount = await prisma.business_profiles.count({
        where: whereClause,
      });

      const LIMIT = 10;
      const allBusinessProfile = {
        data: profiles,
        total: profiles.length,
        page: Number(page) ?? 1,
        limit: limit ?? 10,
        totalPages: Math.ceil(totalProfilesCount / Number(limit ?? LIMIT)),
      };

      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc('searched Business Profiles')
        .responseData({ businessProfiles: allBusinessProfile })
        .send();
    } catch (e: any) {
      console.log(e.message);
      console.error(e);
      return respond.status(400).success(false).code(400).desc(`Error: ${e}`).send();
    }
  };

  createBusinessProfile = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    const profileBody: BusinessCreationBody = req.body;
    const user: JwtPayload = req.user as JwtPayload;

    try {
      // Check Logo Signature
      if (profileBody?.version && profileBody?.signature && profileBody?.publicId) {
        try {
          const expectedSignature = cloudinary.utils.api_sign_request(
            { public_id: profileBody?.publicId, version: profileBody.version },
            this.cloudinaryConfig.api_secret as string
          );
          if (expectedSignature === profileBody?.signature) {
            profileBody['logoUrl'] = profileBody.publicId as string;
          }
        } catch (error) {
          console.error(error);
        }
      }
      // Delete key values
      delete profileBody.version;
      delete profileBody.signature;
      delete profileBody.publicId;
      delete profileBody.deleteLogo;

      // remove empty or null values
      const filteredProfileBody: BusinessCreationBody = removeEmptyOrNullKeyValues(profileBody);
      const businessProfile = await this.businessService.createBusinessProfile(user.id, filteredProfileBody);

      // set account to business
      if (user.role !== Role.BUSINESS) {
        await this.userService.updatUserRole(user.id, Role.BUSINESS);
      }
      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc('Business Profile successful created')
        .responseData({ businessProfile })
        .send();
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  updateBusinessProfile = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    const profileBody: BusinessCreationBody = req.body;
    const user: JwtPayload = req.user as JwtPayload;
    const { id } = req.params;

    try {
      const previousLogoUrl = profileBody.logoUrl as string;
      let deletePreviousLogo = profileBody.deleteLogo as boolean;
      let updateLogo = false;

      // Check Logo Signature
      if (profileBody?.version && profileBody?.signature && profileBody?.publicId) {
        try {
          const expectedSignature = cloudinary.utils.api_sign_request(
            { public_id: profileBody?.publicId, version: profileBody.version },
            this.cloudinaryConfig.api_secret as string
          );
          if (expectedSignature === profileBody?.signature) {
            profileBody['logoUrl'] = profileBody.publicId as string;
            deletePreviousLogo = true;
            updateLogo = true;
          }
        } catch (error) {
          console.error(error);
        }
      }
      // Delete key values
      delete profileBody.version;
      delete profileBody.signature;
      delete profileBody.publicId;

      // Delete old Logo
      if (deletePreviousLogo) {
        try {
          cloudinary.uploader.destroy(previousLogoUrl);
        } catch (error) {
          console.error(error);
        }
      }

      if (deletePreviousLogo && !updateLogo) {
        profileBody['logoUrl'] = null;
      }
      delete profileBody.deleteLogo;

      //standerdize empty string
      const filteredProfileBody = standardizeEmptyKeyValues(profileBody);
      const updatedBusinessProfile = await this.businessService.updateBusinessProfileById(
        id,
        user.id,
        filteredProfileBody
      );
      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc('Business Profile successful updated')
        .responseData({ updatedBusinessProfile })
        .send();
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  listAllProfiles = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    const user: JwtPayload = req.user as JwtPayload;
    try {
      const allBusinessProfile = await this.businessService.findAllBusinessProfileById(user.id);
      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc(`All Business Profiles for ${user.firstName} ${user.lastName}`)
        .responseData({ businessProfiles: allBusinessProfile })
        .send();
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  getProfile = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    const { id } = req.params;
    try {
      const businessProfile = await this.businessService.findBusinessProfileById(id);
      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc(`Business Profile Details for ${businessProfile?.name}`)
        .responseData({ details: businessProfile })
        .send();
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  getBusinessCategories = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    try {
      const businessCategories = await this.businessService.findAllBusinessCategories();
      businessCategories.sort((a, b) => {
        return a.description.localeCompare(b.description);
      });
      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc(`All Business Categories`)
        .responseData({ businessCategories })
        .send();
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  deleteProfile = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    const user: JwtPayload = req.user as JwtPayload;
    const { id } = req.params;
    try {
      const deleteBusinessProfile = await this.businessService.deleteBusinessProfileById(id, user.id);
      const allBusinessProfile = await this.businessService.findAllBusinessProfileById(user.id);
      if (allBusinessProfile.length == 0) {
        //set account to Customer
        await this.userService.updatUserRole(user.id, Role.CUSTOMER);
      }
      return respond
        .status(200)
        .success(true)
        .code(200)
        .desc(`Deleted ${deleteBusinessProfile?.name} Business Profile`)
        .responseData({ deletedProfile: deleteBusinessProfile })
        .send();
    } catch (error) {
      console.error(error);
      return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
    }
  };

  getUploadSignature = async (req: Request, res: Response) => {
    const { folderName } = req.query;
    const respond = new SendResponse(res);

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folderName,
      },
      this.cloudinaryConfig.api_secret as string
    );

    return respond
      .status(200)
      .success(true)
      .code(200)
      .desc(`All Business Categories`)
      .responseData({ timestamp, signature })
      .send();
  };

  contactSupport = async (req: Request, res: Response) => {
    const { personName, email, phoneNumber, problemDescription } = req.body;
    const respond = new SendResponse(res);
    await generateSupportEmail(personName, email, phoneNumber, problemDescription)
      .then(() => console.info(`User complaint sent to - bizconnect24.help@gmail.com`))
      .catch(err => console.error(`User complaint email failed with error message - ${err}`));
    return respond.status(200).success(true).code(200).desc('You Complaint has been sent ').send();
  };
}

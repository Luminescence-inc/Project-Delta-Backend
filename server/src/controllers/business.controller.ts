import businessService from '../services/business.service.js';
import { BusinessCreationBody, BusinessSearchRequestBody } from '../types/business.js';
import { Request, Response } from 'express';
import { JwtPayload } from '../types/auth.js';
import { removeEmptyOrNullKeyValues, standardizeEmptyKeyValues } from '../utils/jwt.util.js';
import SendResponse from '../utils/response.util.js';
import { Role } from '@prisma/client';
import userService from '../services/user.service.js';
import { BusinessProfileFilterField } from '../enums/business.enum.js';

export default class BusinessController {
  private businessService: businessService;
  private userService: userService;

  constructor() {
    this.businessService = new businessService();
    this.userService = new userService();
  }

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

  createBusinessProfile = async (req: Request, res: Response) => {
    const respond = new SendResponse(res);
    const profileBody: BusinessCreationBody = req.body;
    const user: JwtPayload = req.user as JwtPayload;

    try {
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
    const user: JwtPayload = req.user as JwtPayload;
    const { id } = req.params;
    try {
      const businessProfile = await this.businessService.findBusinessProfileById(id, user.id);
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
}

import { BusinessCreationRequestSchema } from "@src/schemas/businessCreationRequest.schema";
import businessService from "@src/services/business.service";
import { BusinessCreationBody } from "@src/types/business";
import { Request, Response } from "express";
import { JwtPayload } from "../types/auth";
import { z } from "zod";
import { removeEmptyOrNullKeyValues, standardizeEmptyKeyValues } from "@src/utils/jwt.util";
import SendResponse from "@src/utils/response.util";
import { Role } from "@prisma/client";
import userService from "@src/services/user.service";

export default class BusinessController {
    private businessService: businessService;
    private userService: userService;


    constructor() {
        this.businessService = new businessService();
        this.userService = new userService();
    }

    createBusinessProfile = async(req: Request, res: Response) => {
        const respond = new SendResponse(res);
        const profileBody: BusinessCreationBody = req.body;
        const user: JwtPayload = req.user as JwtPayload;

        try {
            // remove empty or null values
            const filteredProfileBody: BusinessCreationBody = removeEmptyOrNullKeyValues(profileBody);
            const businessProfile = await this.businessService.createBusinessProfile(user.id, filteredProfileBody);
            
            // set account to business
            if(user.role !== Role.BUSINESS){
                await this.userService.updatUserRole(user.id, Role.BUSINESS);
            }
            return respond.status(200).success(true).code(200).desc("Business Profile successful created").responseData({businessProfile}).send();
        } catch (error) {
            console.error(error);
            return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
        }
     
    }

    updateBusinessProfile = async(req: Request, res: Response) => {
        const respond = new SendResponse(res);
        const profileBody: BusinessCreationBody = req.body;
        const user: JwtPayload = req.user as JwtPayload;
        const {id} = req.params;

        try {
            //standerdize empty string
            const filteredProfileBody = standardizeEmptyKeyValues(profileBody);
            console.info("filteredProfileBody: ", filteredProfileBody)
            const updatedBusinessProfile = await this.businessService.updateBusinessProfileById(id, user.id, filteredProfileBody)
            console.info("updatedBusinessProfile: ",updatedBusinessProfile)
            return respond.status(200).success(true).code(200).desc("Business Profile successful updated").responseData({updatedBusinessProfile}).send();
        } catch (error) {
            console.error(error);
            return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
        }

    }

    listAllProfiles = async(req: Request, res: Response) => {
        const respond = new SendResponse(res);
        const user: JwtPayload = req.user as JwtPayload;
        try {
            const allBusinessProfile = await this.businessService.findAllBusinessProfileById(user.id);
            return respond.status(200).success(true).code(200).desc(`All Business Profiles for ${user.firstName} ${user.lastName}`).responseData({businessProfiles: allBusinessProfile}).send();
        } catch (error) {
            console.error(error);
            return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
        }
    }

    getProfile = async(req: Request, res: Response) => {
        const respond = new SendResponse(res);
        const user: JwtPayload = req.user as JwtPayload;
        const {id} = req.params;
        try {
            const businessProfile = await this.businessService.findBusinessProfileById(id, user.id);
            return respond.status(200).success(true).code(200).desc(`Business Profile Details for ${businessProfile?.name}`).responseData({details: businessProfile}).send();
        } catch (error) {
            console.error(error);
            return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
        }
    }

    getBusinessCategories = async(req: Request, res: Response) => {
        const respond = new SendResponse(res);
        try {
            const businessCategories = await this.businessService.findAllBusinessCategories();
            return respond.status(200).success(true).code(200).desc(`All Business Categories`).responseData({businessCategories}).send();
        } catch (error) {
            console.error(error);
            return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
        }
    }

    deleteProfile = async(req: Request, res: Response) => {
        const respond = new SendResponse(res);
        const user: JwtPayload = req.user as JwtPayload;
        const {id} = req.params;
        try {
            const deleteBusinessProfile = await this.businessService.deleteBusinessProfileById(id, user.id);
            const allBusinessProfile = await this.businessService.findAllBusinessProfileById(user.id);
            if(allBusinessProfile.length==0){
                //set account to Customer
                await this.userService.updatUserRole(user.id, Role.CUSTOMER);
            }
            return respond.status(200).success(true).code(200).desc(`Deleted ${deleteBusinessProfile?.name} Business Profile`).responseData({deletedProfile: deleteBusinessProfile}).send();
        } catch (error) {
            console.error(error);
            return respond.status(400).success(false).code(400).desc(`Error: ${error}`).send();
        }

    }
}
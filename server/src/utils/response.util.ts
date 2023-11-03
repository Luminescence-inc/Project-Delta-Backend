import { BaseResponseMessage } from "@src/types/auth";
import { Response } from "express";

export default class SendResponse {
    res: Response;
    statusCode: number;
    successStatus: boolean;
    messageCode: number|null;
    messageDesc: string|null;
    messageData: object;

    constructor(res: Response){
        this.res = res;
        this.statusCode = 400;
        this.successStatus = false;
        this.messageCode = null;
        this.messageDesc = null;
        this.messageData = {};
    }

    status(statusCode: number){
        this.statusCode = statusCode;
        return this;
    }

    success(successStatus: boolean){
        this.successStatus = successStatus;
        return this;
    }

    code(messageCode: number){
        this.messageCode = messageCode;
        return this;
    }

    desc(messageDesc: string){
        this.messageDesc = messageDesc;
        return this;
    }

    responseData(data: object){
        this.messageData = data;
        return this;
    }

    send(){
        const response = getBaseResponseMessage();
        response.success = this.successStatus;
        response.message.code = this.messageCode;
        response.message.desc = this.messageDesc;
        response.data = this.messageData;
        
        return this.res.status(this.statusCode).send(response);
    }
}

export const getBaseResponseMessage = (): BaseResponseMessage => {
    return {
        success: null,
        message: {
            code: null,
            desc: null,
        },
        data: {}
    }
}
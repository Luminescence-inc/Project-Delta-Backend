import { Role } from "@prisma/client";

export interface JwtPayload {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    verified: Boolean;
    iat?: number;
    exp?: number;
}

export interface UpdateUserDetailsRequest {
    firstName: string;
    lastName: string;
    password: string;
}

export interface BaseResponseMessage {
    success: boolean | null;
    message: BaseMessage;
    data:   object | null;
}

export interface BaseMessage {
    code: number | null;
    desc: string | null;
}

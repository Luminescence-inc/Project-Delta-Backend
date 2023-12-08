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

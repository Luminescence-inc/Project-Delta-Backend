import jwtToken from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

export const jwtTokenSecret = process.env.JWT_TOKEN_SECRET as string
const expires =  process.env.JWT_TOKEN_SECRET_EXP || "1d";

export const  getJwtToken = (payload: JwtPayload): string => {
    return jwtToken.sign(payload, jwtTokenSecret, {expiresIn: expires})
} 

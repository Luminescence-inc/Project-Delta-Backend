import jwtToken from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.js';

export const jwtTokenSecret = process.env.JWT_TOKEN_SECRET as string;
const expires = process.env.JWT_TOKEN_SECRET_EXP || '1d';

export const getJwtToken = (payload: JwtPayload): string => {
  return jwtToken.sign(payload, jwtTokenSecret, { expiresIn: expires });
};

export const removeEmptyOrNullKeyValues = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      result[key] = obj[key];
    }
  }

  return result;
};

export const standardizeEmptyKeyValues = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === '') {
      result[key] = null;
    } else {
      result[key] = obj[key];
    }
  }

  return result;
};

import { z } from "zod";

/**
 * Base Request Schema
 */

export const RequestSchema = z.object({
    body: z.any(),
    params: z.any(),
    query: z.any(),
  });


/**
 * Authenticated requests using client Token.
 * Incoming request with JWT Bearer Token from react application.
 */
export const AuthRequestSchema = z.object({
    body: z.any(),
    params: z.any(),
    query: z.any(),
    user: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      role: z.string(),
      iat: z.number(),
      exp: z.number(),
    }),
  });
  
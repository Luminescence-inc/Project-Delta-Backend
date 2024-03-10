import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

/**
 * Express middleware used to validate an incoming requests body, query and params
 * against a given Zod schema and throws a 400 error response if validation fails.
 * @param schema Zod Schema to validate against
 * @returns express middleware function
 */
export const validate =
  (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    const { body, query, params, user } = req;

    await schema
      .parseAsync({
        body,
        query,
        params,
        user,
      })
      .then(() => {
        next();
      })
      .catch((err: ZodError) => {
        console.error(`Request for ${req.path} failed validation with:`, err);
        return res.status(400).send(err.issues);
      });
  };

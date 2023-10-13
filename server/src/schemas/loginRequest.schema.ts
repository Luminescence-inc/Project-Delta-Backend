import { z } from "zod";
import { RequestSchema } from "./request.schema";

export const LoginRequestSchema = RequestSchema.extend({
    body: z.object({
        email: z.string(),
        password: z.string(),
    }),
  });
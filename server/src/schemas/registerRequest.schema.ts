import { z } from 'zod';
import { RequestSchema } from './request.schema.js';

export const RegisterRequestSchema = RequestSchema.extend({
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    password: z.string(),
  }),
});

import { z } from 'zod';
import { RequestSchema } from './request.schema.js';

export const UpdateUserDetailsSchema = RequestSchema.extend({
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    password: z.string(),
  }),
});

import { z } from 'zod';
import { RequestSchema } from './request.schema.js';

export const BusinessCreationRequestSchema = RequestSchema.extend({
  body: z.object({
    name: z.string().refine(value => value.trim() !== '', {
      message: 'String must not be empty',
    }),
    description: z.string().nullable(),
    businessCategoryUuid: z.string().refine(value => value.trim() !== '', {
      message: 'String must not be empty',
    }),
    country: z.string().refine(value => value.trim() !== '', {
      message: 'String must not be empty',
    }),
    stateAndProvince: z.string().refine(value => value.trim() !== '', {
      message: 'String must not be empty',
    }),
    city: z.string().refine(value => value.trim() !== '', {
      message: 'String must not be empty',
    }),
    street: z.string().nullable(),
    postalCode: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    businessEmail: z.string().nullable(),
    openTime: z.string().nullable(),
    closeTime: z.string().nullable(),
    daysOfOperation: z.array(z.string()).nullable(),
    websiteUrl: z.string().nullable(),
    linkedinUrl: z.string().nullable(),
    instagramUrl: z.string().nullable(),
    twitterUrl: z.string().nullable(),
    facebookUrl: z.string().nullable(),
    publicId: z.string().nullable(),
    version: z.number().nullable(),
    signature: z.string().nullable(),
  }),
});

import { z } from 'zod';
import { RequestSchema } from './request.schema.js';
import { BusinessProfileFilterField, SortBy, SortDirection } from '../enums/business.enum.js';

export const BusinessSearchRequestSchema = RequestSchema.extend({
  body: z.object({
    paging: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      sortBy: z
        .string()
        .nonempty()
        .refine(sortby => {
          const sortBy: string[] = Object.values(SortBy);
          return sortBy.includes(sortby);
        }),
      sortDirection: z
        .string()
        .nonempty()
        .refine(direction => {
          const sortDirection: string[] = Object.values(SortDirection);
          return sortDirection.includes(direction);
        }),
    }),
    search: z.object({
      filters: z.array(
        z.object({
          targetFieldName: z
            .string()
            .nonempty()
            .refine(field => {
              const filterFields: string[] = Object.values(BusinessProfileFilterField);
              return filterFields.includes(field);
            }),
          values: z.array(z.string()),
        })
      ),
    }),
  }),
});

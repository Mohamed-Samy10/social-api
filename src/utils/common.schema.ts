import { z } from 'zod';

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

export const idParamSchema = (paramName: string) => z.object({
  [paramName]: z.coerce.number().int().positive()
});
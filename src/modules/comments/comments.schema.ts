import { z } from 'zod';
import { paginationSchema, idParamSchema } from '../../utils/common.schema';


export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000).trim()
});

export const listCommentsQuerySchema = paginationSchema.extend({
  limit: z.coerce.number().min(1).max(50).default(10)
});


export type CreateCommentInput = z.infer<typeof createCommentSchema>;

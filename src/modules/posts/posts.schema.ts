
import {z} from 'zod';
import { paginationSchema } from '../../utils/common.schema';

export const createPostSchema = z.object({
  content: z.string().min(1).max(500).trim()
});

export const listPostsSchema = paginationSchema;

export const postIdParamSchema = z.object({
  postId: z.coerce.number().int().positive()
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsSchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;

import {z} from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1).max(500).trim()
});

export const listPostsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  cursor: z.string().optional()
});

export const postIdParamSchema = z.object({
  postId: z.coerce.number().int().positive()
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsSchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
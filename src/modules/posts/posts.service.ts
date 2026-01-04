import { db } from '../../config/db';
import { posts, users } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const postsService = {
  async list(page = 1, limit = 10) {
    console.log('[SERVICE] posts.list', { page, limit });
    const offset = (page - 1) * limit;

    return await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          name: users.name
        }
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async findById(id: number) {
    console.log('[SERVICE] posts.findById', { id });
    const result = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          name: users.name
        }
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.userId))
      .where(eq(posts.id, id));

    return result[0] ?? null;
  },

  async create(userId: number, content: string) {
    const result = await db
      .insert(posts)
      .values({ userId, content })
      .returning({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt
      });

    return result[0];
  }
};

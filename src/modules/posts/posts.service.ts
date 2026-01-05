import { db } from '../../config/db';
import { posts, users,likes } from '../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { likesService } from '../likes/likes.service';

const CURRENT_USER_ID = 1;
export const postsService = {
  async list(page = 1, limit = 10) {
    console.log('[SERVICE] posts.list', { page, limit });
    const offset = (page - 1) * limit;

    const rows = await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      author: {
        id: users.id,
        name: users.name
      },
      likesCount: sql<number>`count(${likes.id})`,
        isLiked: sql<boolean>`
          bool_or(${likes.userId} = ${CURRENT_USER_ID})
        `
    })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.userId))
      .leftJoin(likes,
        sql`${likes.likeableId} = ${posts.id} 
        AND ${likes.likeableType} = 'post'
        `
      )
      .groupBy(posts.id, users.id)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return Promise.all(
  rows.map(async (post) => {
    const likesCount = await likesService.count(
      post.id,
      'post'
    );

    const isLiked = await likesService.isLiked(
      CURRENT_USER_ID, 
      post.id,
      'post'
    );

    return {
      ...post,
      likesCount,
      isLiked
    };
  })
);  
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

    const post = result[0];
if (!post) return null;

const likesCount = await likesService.count(
  post.id,
  'post'
);

const isLiked = await likesService.isLiked(
  CURRENT_USER_ID,
  post.id,
  'post'
);

return {
  ...post,
  likesCount,
  isLiked
};

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

    return {...result[0],
    likesCount: 0,
  isLiked: false
    };
  }
};

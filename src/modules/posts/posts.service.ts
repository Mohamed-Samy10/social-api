import { db } from '../../config/db';
import { posts, users,likes } from '../../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { likesService } from '../likes/likes.service';
import { parseCursor } from '../comments/comments.service';
const CURRENT_USER_ID = 1;


export const postsService = {
  async list(
    limit = 10,
    cursor?: string,
    currentUserId = CURRENT_USER_ID,
  ) {
    const parsedCursor = parseCursor(cursor);
    const conditions = [];
    if (parsedCursor) {
      conditions.push(
        sql`(${posts.createdAt} < ${parsedCursor.createdAt.toISOString()}::timestamp
        OR (${posts.createdAt} = ${parsedCursor.createdAt.toISOString()}::timestamp
        AND ${posts.id} < ${parsedCursor.id}))`
      );
    }
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
        coalesce(
          bool_or(${likes.userId} = ${currentUserId}),
          false
        )
        `
    })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.userId))
      .leftJoin(likes,
        sql`${likes.likeableId} = ${posts.id} 
        AND ${likes.likeableType} = 'post'
        `
      )
      .where(
        conditions.length ? and(...conditions) : undefined
      )

      .groupBy(posts.id, users.id, users.name)
      .orderBy(sql`${posts.createdAt} DESC`,
        sql`${posts.id} DESC`)
      .limit(limit+1)
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;

    let nextCursor: string | null = null;
    if (hasNextPage && items.length > 0) {
      const lastItem = items.at(-1)!;
      if (lastItem.createdAt) {
        nextCursor = `${lastItem.createdAt.toISOString()}|${lastItem.id}`;
      } else {
        nextCursor = `${lastItem.id}`;
      }
    }
    

    return ({items, nextCursor}
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
        },
        likesCount: sql<number>`count(${likes.id})`,
        isLiked: sql<boolean>`
        coalesce(
          bool_or(${likes.userId} = ${CURRENT_USER_ID}),
          false
        )
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

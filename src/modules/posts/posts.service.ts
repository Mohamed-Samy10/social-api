import { db } from '../../config/db';
import { posts, users,likes } from '../../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { parseCursor } from '../comments/comments.service';

export const postsService = {
  async list(
    currentUserId:number,
    limit = 10,
    cursor?: string,
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

async findById(postId: number, currentUserId: number) {
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
          bool_or(${likes.userId} = ${currentUserId}),
          false
        )
      `
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .leftJoin(
      likes,
      sql`${likes.likeableId} = ${posts.id}
          AND ${likes.likeableType} = 'post'`
    )
    .where(eq(posts.id, postId))
    .groupBy(posts.id, users.id);

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

    return {...result[0],
    likesCount: 0,
  isLiked: false
    };
  }
};

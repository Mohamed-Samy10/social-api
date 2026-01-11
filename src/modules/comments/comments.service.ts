import { db } from '../../config/db';
import { comments } from '../../db/schema/comments';
import { likes, users } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { CreateCommentInput } from './comments.schema';

/* ===============================
   Helpers
================================ */

export function parseCursor(cursor?: string) {
  if (!cursor) return null;

  const [createdAt, id] = cursor.split('|');
  return {
    createdAt: new Date(createdAt),
    id: Number(id)
  };
}

/* ===============================
   Service
================================ */

export const commentsService = {
  /* -------- Create comment on post -------- */
  // async createForPost(
  //   userId: number,
  //   postId: number,
  //   content: string
  // ) {
  //   const [comment] = await db
  //     .insert(comments)
  //     .values({
  //       userId,
  //       content,
  //       commentableId: postId,
  //       commentableType: 'post'
  //     })
  //     .returning();

  //   return {
  //     ...comment,
  //     likesCount: 0,
  //     isLiked: false
  //   };
  // },

  // /* -------- Create reply on comment -------- */
  // async createReply(
  //   userId: number,
  //   commentId: number,
  //   content: string
  // ) {
  //   const [reply] = await db
  //     .insert(comments)
  //     .values({
  //       userId,
  //       content,
  //       commentableId: commentId,
  //       commentableType: 'comment'
  //     })
  //     .returning();

  //   return {
  //     ...reply,
  //     likesCount: 0,
  //     isLiked: false
  //   };
  // },

    async create(
    userId: number,
    targetId: number,
    targetType: 'post' | 'comment',
    input: CreateCommentInput
    ) {
    const [comment] = await db
      .insert(comments)
      .values({
        userId,
        content: input.content,
        commentableId: targetId,
        commentableType: targetType
      })
      .returning();

    return {
      ...comment,
      likesCount: 0,
      isLiked: false
    };
  },

  /* -------- List comments for post (cursor pagination) -------- */
//   
  async list(
    userId: number,
    targetId: number,
    targetType: 'post' | 'comment',
    query: { limit: number; cursor?: string }
  ) {
    const parsedCursor = parseCursor(query.cursor);
    const conditions = [
      eq(comments.commentableId, targetId),
      eq(comments.commentableType, targetType)
    ];

    if (parsedCursor) {
      conditions.push(
        sql`(${comments.createdAt} < ${parsedCursor.createdAt.toISOString()}::timestamp 
        OR (${comments.createdAt} = ${parsedCursor.createdAt.toISOString()}::timestamp AND ${comments.id} < ${parsedCursor.id}))`
      );
    }
    const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      author: {
        id: users.id,
        name: users.name
      },
      likesCount: sql<number>`count(${likes.id})`,
      isLiked: sql<boolean>`
        coalesce(
          bool_or(${likes.userId} = ${userId}),
          false
        )`
    })
      .from(comments)
      .innerJoin(users, eq(users.id, comments.userId))
      .leftJoin(likes,
        sql`${likes.likeableId} = ${comments.id} 
        AND ${likes.likeableType} = 'comment'
        `
      )
      .where(and(...conditions))
      .groupBy(comments.id, users.id, users.name)
      .orderBy(
        sql`${comments.createdAt} DESC`,
        sql`${comments.id} DESC`
      )
      .limit(query.limit + 1);
    const hasNextPage = rows.length > query.limit;
    const items = hasNextPage ? rows.slice(0, query.limit) : rows;
    let nextCursor: string | null = null;
    if (hasNextPage && items.length > 0) {
      const lastItem = items.at(-1)!;
      if (lastItem.createdAt) {
        nextCursor = `${lastItem.createdAt.toISOString()}|${lastItem.id}`;
      } else {
        nextCursor = `${lastItem.id}`;
      }
    }
    return { items, nextCursor };
  }
};


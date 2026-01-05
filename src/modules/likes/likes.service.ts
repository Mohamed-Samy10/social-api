import { db } from '../../config/db';
import { likes } from '../../db/schema/likes';
import { eq, and, sql } from 'drizzle-orm';

export const likesService = {
  async like(
    userId: number,
    likeableId: number,
    likeableType: 'post' | 'comment'
  ) {
    const [like] = await db
      .insert(likes)
      .values({
        userId,
        likeableId,
        likeableType
      })
      .onConflictDoNothing()
      .returning();

    return like;
  },

  async unlike(
    userId: number,
    likeableId: number,
    likeableType: 'post' | 'comment'
  ) {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.likeableId, likeableId),
          eq(likes.likeableType, likeableType)
        )
      );
  },

  async count(
    likeableId: number,
    likeableType: 'post' | 'comment'
  ) {
    const [result] = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(likes)
      .where(
        and(
          eq(likes.likeableId, likeableId),
          eq(likes.likeableType, likeableType)
        )
      );

    return Number(result.count);
  },

  async isLiked(
    userId: number,
    likeableId: number,
    likeableType: 'post' | 'comment'
  ) {
    const [row] = await db
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.likeableId, likeableId),
          eq(likes.likeableType, likeableType)
        )
      )
      .limit(1);

    return !!row;
  }
};

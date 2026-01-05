import { db } from '../../config/db';
import { comments } from '../../db/schema/comments';
import { eq, and } from 'drizzle-orm';

export const commentsService = {
  async createForPost(
    userId: number,
    postId: number,
    content: string
  ) {
    const [comment] = await db
      .insert(comments)
      .values({
        userId,
        content,
        commentableId: postId,
        commentableType: 'post'
      })
      .returning();

    return comment;
  },

  async createReply(
    userId: number,
    commentId: number,
    content: string
  ) {
    const [reply] = await db
      .insert(comments)
      .values({
        userId,
        content,
        commentableId: commentId,
        commentableType: 'comment'
      })
      .returning();

    return reply;
  },

  async listForPost(postId: number) {
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.commentableId, postId),
          eq(comments.commentableType, 'post')
        )
      )
      .orderBy(comments.createdAt);
  },

  async listReplies(commentId: number) {
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.commentableId, commentId),
          eq(comments.commentableType, 'comment')
        )
      )
      .orderBy(comments.createdAt);
  }
};

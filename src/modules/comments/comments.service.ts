import { db } from '../../config/db';
import { comments } from '../../db/schema/comments';
import { eq, and } from 'drizzle-orm';
import { likesService } from '../likes/likes.service';  
import { likes } from '../../db/schema';
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

    return {
      ...reply,
      likesCount: 0,
      isLiked: false
    };
  },

  async listForPost(postId: number) {
    const rows = await db
      .select()
      .from(comments)
      .where( 
        and(
          eq(comments.commentableId, postId),
          eq(comments.commentableType, 'post')
        )
      )
      .orderBy(comments.createdAt);
    return Promise.all(
      rows.map(async (comment) => {
        const likesCount = await likesService.count(
          comment.id
        , 'comment');
        const isLiked = await likesService.isLiked(
          1,//assuming user id 1 for now
          comment.id
        , 'comment');
        return {
          ...comment,
          likesCount,
          isLiked
        };
      })
    );
  },

  async listReplies(commentId: number) {
    const rows = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.commentableId, commentId),
          eq(comments.commentableType, 'comment')
        )
      )
      .orderBy(comments.createdAt);

    return Promise.all(
      rows.map(async (reply) => {
        const likesCount = await likesService.count(
          reply.id,
          'comment'
        );

        const isLiked = await likesService.isLiked(
          1, // Assuming userId 1 for now
          reply.id,
          'comment'
        );

        return {
          ...reply,
          likesCount,
          isLiked
        };
      })
    );
  }
};
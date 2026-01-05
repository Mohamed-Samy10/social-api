import { db } from '../../config/db';
import { comments } from '../../db/schema/comments';
import { eq, and, sql } from 'drizzle-orm';
import { likesService } from '../likes/likes.service';  
import { likes } from '../../db/schema';

const CURRENT_USER_ID = 1;
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
      .select({
        id: comments.id,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        likesCount: sql<number>`count(${likes.id})`,
        isLiked: sql<boolean>`
          bool_or(${likes.userId} = 1)
        `
      })
      .from(comments)
      .leftJoin(likes,
        sql`${likes.likeableId} = ${comments.id} 
        AND ${likes.likeableType} = 'comment'
        `
      )
      .where( 
        and(
          eq(comments.commentableId, postId),
          eq(comments.commentableType, 'post')
        )
      )
      .groupBy(comments.id)
      .orderBy(comments.createdAt);
    return Promise.all(
      rows.map(async (comment) => {
        const likesCount = await likesService.count(
          comment.id
        , 'comment');
        const isLiked = await likesService.isLiked(
          CURRENT_USER_ID,
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
      .select({
        id: comments.id,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        likesCount: sql<number>`count(${likes.id})`,
        isLiked: sql<boolean>`
          bool_or(${likes.userId} = 1)
        `
      })
      .from(comments)
      .leftJoin(likes,
        sql`${likes.likeableId} = ${comments.id} 
        AND ${likes.likeableType} = 'comment'
        `
      ) 
      .where(
        and(
          eq(comments.commentableId, commentId),
          eq(comments.commentableType, 'comment')
        )
      )
      .groupBy(comments.id)
      .orderBy(comments.createdAt);

    return Promise.all(
      rows.map(async (reply) => {
        const likesCount = await likesService.count(
          reply.id,
          'comment'
        );

        const isLiked = await likesService.isLiked(
          CURRENT_USER_ID,
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
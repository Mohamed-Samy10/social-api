import { Elysia, t } from 'elysia';
import { commentsService } from './comments.service';
import { success } from '../../utils/response';
import { authGuard } from '../auth/auth.guard';

export const commentsRoutes = new Elysia()
  .use(authGuard)
  .get('/posts/:postId/comments', async ({ user,params, query }) => {
    const postId = Number(params.postId);
    const limit = Number(query.limit?? 10);
    const cursor = query.cursor as string | undefined;
    const { items, nextCursor } = await commentsService.listForPost(
      user.id,
      postId,
      limit,
      cursor
    );
    return success(items, { limit, nextCursor });
  })

  .post(
    '/posts/:postId/comments',
    async ({ params, body, user }) => {
      const comment = await commentsService.createForPost(
        user.id,
        Number(params.postId),
        body.content
      );
      return success(comment);
    },
    {
      body: t.Object({
        content: t.String({ minLength: 1 })
      })
    }
  )

  .get('/comments/:commentId/replies', async ({ user,params, query }) => {
    const commentId = Number(params.commentId);
    const limit = Number(query.limit ?? 10);
    const cursor = query.cursor as string | undefined;
    const { items, nextCursor } = await commentsService.listReplies(
      user.id,
      commentId,
      limit,
      cursor
    );
    return success(items, { limit, nextCursor });
  })

  .post(
    '/comments/:commentId/replies',
    async ({ user, params, body }) => {
      const reply = await commentsService.createReply(
        user.id,
        Number(params.commentId),
        body.content
      );
      return success(reply);
    },
    {
      body: t.Object({
        content: t.String({ minLength: 1 })
      })
    }
  );

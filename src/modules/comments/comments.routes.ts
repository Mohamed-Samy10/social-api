import { Elysia, t } from 'elysia';
import { commentsService } from './comments.service';
import { success } from '../../utils/response';

export const commentsRoutes = new Elysia()
  .get('/posts/:postId/comments', async ({ params }) => {
    const data = await commentsService.listForPost(
      Number(params.postId)
    );
    return success(data);
  })

  .post(
    '/posts/:postId/comments',
    async ({ params, body }) => {
      const comment = await commentsService.createForPost(
        1,
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

  .get('/comments/:commentId/replies', async ({ params }) => {
    const data = await commentsService.listReplies(
      Number(params.commentId)
    );
    return success(data);
  })

  .post(
    '/comments/:commentId/replies',
    async ({ params, body }) => {
      const reply = await commentsService.createReply(
        1,
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

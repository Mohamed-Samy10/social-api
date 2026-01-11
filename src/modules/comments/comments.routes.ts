import { Elysia, t } from 'elysia';
import { commentsService } from './comments.service';
import { success } from '../../utils/response';
import { authGuard } from '../auth/auth.guard';
import { createCommentSchema, listCommentsQuerySchema } from './comments.schema';
import { idParamSchema } from '../../utils/common.schema';

export const commentsRoutes = new Elysia()
  .use(authGuard)
  .get('/posts/:postId/comments', async ({ user,params, query }) => {
    const { items, nextCursor } = await commentsService.list(
      user.id,
     params.postId,
      'post',
      query
    );
    return success(items, { limit: query.limit, nextCursor });
  }, {
    params: idParamSchema('postId'),
    query: listCommentsQuerySchema
  })

  .post(
    '/posts/:postId/comments',
    async ({ params, body, user }) => {
      const comment = await commentsService.create(
        user.id,
        params.postId,
        'post',
        body
      );
      return success(comment);
    },
    {
      params: idParamSchema('postId'),
      body: createCommentSchema
      })

  .get('/comments/:commentId/replies', async ({ user,params, query }) => {
  
    const { items, nextCursor } = await commentsService.list(
      user.id,
      params.commentId,
      'comment',
      query
    );
    return success(items, { limit:query.limit, nextCursor });
  }, {
    params:idParamSchema('commentId'),
    query: listCommentsQuerySchema
  })

  .post(
    '/comments/:commentId/replies',
    async ({ user, params, body }) => {
      const reply = await commentsService.create(
        user.id,
        params.commentId,
        'comment',
        body
      );
      return success(reply);
    },
    {
      params:idParamSchema("commentId"),
      body:createCommentSchema

      });

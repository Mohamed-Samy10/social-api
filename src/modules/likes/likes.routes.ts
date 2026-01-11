import { Elysia, t } from 'elysia';
import { likesService } from './likes.service';
import { success } from '../../utils/response';
import { authGuard } from '../auth/auth.guard';
import { idParamSchema } from '../../utils/common.schema';

export const likesRoutes = new Elysia()
  .use(authGuard)
  .post(
    '/posts/:postId/likes',
    async ({ params, user }) => {
      const like = await likesService.like(
        user.id,
        params.postId,
        'post'
      );
      return success(like);
    }, {
      params: idParamSchema('postId')
    }
    
  )

  .delete('/posts/:postId/likes', async ({ params, user }) => {
    await likesService.unlike(
      user.id,
      params.postId,
      'post'
    );
    return success(true);
  },{
    params:idParamSchema("postId")
  })

  .post(
    '/comments/:commentId/likes',
    async ({ params, user }) => {
      const like = await likesService.like(
        user.id,
        params.commentId,
        'comment'
      );
      return success(like);
    }, {
      params:idParamSchema("commentId")
    }
  )

  .delete('/comments/:commentId/likes', async ({ params, user }) => {
    await likesService.unlike(
      user.id,
      params.commentId,
      'comment'
    );
    return success(true);
  }, {
    params:idParamSchema("commentId")
  });

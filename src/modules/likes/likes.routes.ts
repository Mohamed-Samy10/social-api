import { Elysia, t } from 'elysia';
import { likesService } from './likes.service';
import { success } from '../../utils/response';
import { authGuard } from '../auth/auth.guard';

export const likesRoutes = new Elysia()
  .use(authGuard)
  .post(
    '/posts/:postId/likes',
    async ({ params, user }) => {
      const like = await likesService.like(
        user.id,
        Number(params.postId),
        'post'
      );
      return success(like);
    }
  )

  .delete('/posts/:postId/likes', async ({ params, user }) => {
    await likesService.unlike(
      user.id,
      Number(params.postId),
      'post'
    );
    return success(true);
  })

  .post(
    '/comments/:commentId/likes',
    async ({ params, user }) => {
      const like = await likesService.like(
        user.id,
        Number(params.commentId),
        'comment'
      );
      return success(like);
    }
  )

  .delete('/comments/:commentId/likes', async ({ params, user }) => {
    await likesService.unlike(
      user.id,
      Number(params.commentId),
      'comment'
    );
    return success(true);
  });

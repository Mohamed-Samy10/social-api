import { Elysia, t } from 'elysia';
import { likesService } from './likes.service';
import { success } from '../../utils/response';

export const likesRoutes = new Elysia()

  .post(
    '/posts/:postId/likes',
    async ({ params }) => {
      const like = await likesService.like(
        1,
        Number(params.postId),
        'post'
      );
      return success(like);
    }
  )

  .delete('/posts/:postId/likes', async ({ params }) => {
    await likesService.unlike(
      1,
      Number(params.postId),
      'post'
    );
    return success(true);
  })

  .post(
    '/comments/:commentId/likes',
    async ({ params }) => {
      const like = await likesService.like(
        1,
        Number(params.commentId),
        'comment'
      );
      return success(like);
    }
  )

  .delete('/comments/:commentId/likes', async ({ params }) => {
    await likesService.unlike(
      1,
      Number(params.commentId),
      'comment'
    );
    return success(true);
  });

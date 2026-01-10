import { Elysia, t } from 'elysia';
import { postsService } from './posts.service';
import { success } from '../../utils/response';
import { authGuard } from '../auth/auth.guard';

export const postsRoutes = new Elysia({
  prefix: '/posts'
})
  .use(authGuard)
  .get('/', async ({ user, query }) => {
    const limit = Number(query.limit ?? 10);
    const cursor = query.cursor as string | undefined;

    const { items, nextCursor } = await postsService.list(
      user.id,
      limit,
      cursor
    );

    return success(items, { limit, cursor: nextCursor });
  })

  .get('/:postId', async ({ user, params }) => {
    const post = await postsService.findById(
      Number(params.postId),
      user.id
    );

    if (!post) {
      return { status: 404, message: 'Post not found' };
    }

    return success(post);
  })

  .post(
    '/',
    async ({ user, body }) => {
      const post = await postsService.create(
        user.id,
        body.content
      );

      return success(post);
    },
    {
      body: t.Object({
        content: t.String({ minLength: 1 })
      })
    }
  );

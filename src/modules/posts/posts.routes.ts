import { Elysia, t } from 'elysia';
import { postsService } from './posts.service';
import { success } from '../../utils/response';

export const postsRoutes = new Elysia({
  prefix: '/posts'
})
  .get('/', async ({ params,query }) => {
    const limit = Number(query.limit?? 10);
    const cursor = query.cursor as string | undefined;

    const data = await postsService.list(limit, cursor);
    return success(data, { limit, cursor });
  })
  .get('/:postId', async ({ params }) => {
    console.log('[POSTS] GET /posts');
    const post = await postsService.findById(Number(params.postId));
    if (!post) {
      return { status: 404, message: 'Post not found' };
    }
    return success(post);
  })
  .post(
    '/',
    async ({ body }) => {
      const post = await postsService.create(1, body.content);
      return success(post);
    },
    {
      body: t.Object({
        content: t.String({ minLength: 1 })
      })
    }
  );

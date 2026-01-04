import { Elysia, t } from 'elysia';
import { postsService } from './posts.service';
import { success } from '../../utils/response';

export const postsRoutes = new Elysia({
  prefix: '/posts'
})
  .get('/', async ({ query }) => {
    console.log('[POSTS] GET /posts'); 
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);

    const data = await postsService.list(page, limit);
    return success(data, { page, limit });
  })
  .get('/:id', async ({ params }) => {
    console.log('[POSTS] GET /posts');
    const post = await postsService.findById(Number(params.id));
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

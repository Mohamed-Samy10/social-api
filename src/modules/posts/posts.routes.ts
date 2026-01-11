import { Elysia, t } from 'elysia';
import { postsService } from './posts.service';
import { success } from '../../utils/response';
import { authGuard } from '../auth/auth.guard';
import {createPostSchema, listPostsSchema, postIdParamSchema} from './posts.schema';



export const postsRoutes = new Elysia({
  prefix: '/posts'
})
  .use(authGuard)
  .get('/', async ({ user, query:{limit, cursor} }) => {

    const { items, nextCursor } = await postsService.list(
      user.id,
      limit,
      cursor
    );

    return success(items, { limit, nextCursor });
  }, {
    query: listPostsSchema
  })

  .get('/:postId', async ({ user, params }) => {
    const post = await postsService.findById(
      params.postId,
      user.id
    );

    if (!post) {
      return { status: 404, message: 'Post not found' };
    }

    return success(post);
  }, {
    params: postIdParamSchema
  })

  .post(
    '/',
    async ({ user, body }) => {
      const post = await postsService.create(
        user.id,
        body
      );

      return success(post);
    },
    {
      body: createPostSchema
    }
  );
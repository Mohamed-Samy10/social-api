import { Elysia } from 'elysia';
// import { authRoutes } from './modules/auth/auth.routes';
import { postsRoutes } from './modules/posts/posts.routes';

export const app = new Elysia({
  prefix: '/api/v1'
})
  .get('/health', () => ({
    status: 'ok'
  }))
//   .use(authRoutes)
  .use(postsRoutes);

import { Elysia } from 'elysia'
import { authRoutes } from './modules/auth/auth.routes'
import { postsRoutes } from './modules/posts/posts.routes'
import { commentsRoutes } from './modules/comments/comments.routes'
import { likesRoutes } from './modules/likes/likes.routes'
import { authGuard } from './modules/auth/auth.guard'

export const app = new Elysia({
  prefix: '/api/v1'
})
  // Public routes
  .get('/health', () => ({ status: 'ok' }))
  .use(authRoutes)

  // Protected routes
  .group('', app =>
    app
      .use(authGuard)
      .use(postsRoutes)
      .use(commentsRoutes)
      .use(likesRoutes)
  )

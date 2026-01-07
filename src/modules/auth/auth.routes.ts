import { Elysia } from 'elysia';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';

export const authRoutes = new Elysia({
  prefix: '/auth'
})
  .post(
    '/register',
    async ({ body }) => {
      return authService.register(
        body.name,
        body.email,
        body.password
      );
    },
    {
      body: registerSchema
    }
  )
  .post(
    '/login',
    async ({ body }) => {
      return authService.login(
        body.email,
        body.password
      );
    },
    {
      body: loginSchema
    }
  );

import { Elysia } from 'elysia';
import { verifyToken } from '../../utils/jwt';

export const authGuard = new Elysia()
  .derive({ as: 'scoped' }, ({ headers }) => {
    const auth = headers.authorization;

    if (!auth?.startsWith('Bearer '))
      throw new Error('Unauthorized');

    const token = auth.replace('Bearer ', '');

    try {
      const payload = verifyToken(token);

      return {
        user: {
          id: payload.userId
        }
      };
    } catch {
      throw new Error('Invalid or expired token');
    }
  });

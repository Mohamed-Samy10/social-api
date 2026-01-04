import { t } from 'elysia';

export const createPostSchema = t.Object({
  content: t.String({
    minLength: 1,
    maxLength: 500
  })
});

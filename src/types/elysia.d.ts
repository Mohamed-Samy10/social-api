import 'elysia';

declare module 'elysia' {
  interface Context {
    user: { id: number } | null;
  }
}
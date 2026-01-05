import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id),

  content: text('content').notNull(),

  commentableId: integer('commentable_id').notNull(),

  commentableType: varchar('commentable_type', {
    length: 20
  }).notNull(), // 'post' | 'comment'

  createdAt: timestamp('created_at').defaultNow()
});

import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const likes = pgTable(
  'likes',
  {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id),

    likeableId: integer('likeable_id').notNull(),

    likeableType: varchar('likeable_type', {
      length: 20
    }).notNull(), // 'post' | 'comment'

    createdAt: timestamp('created_at').defaultNow()
  },
  (table) => ({
    // 👇 يمنع نفس اليوزر يعمل لايك مرتين
    uniqueLike: uniqueIndex('unique_like').on(
      table.userId,
      table.likeableId,
      table.likeableType
    ),

    likeableIdx: index('likeable_idx').on(
      table.likeableId,
      table.likeableType
    )
  })
);

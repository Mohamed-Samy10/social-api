import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),

    name: text('name').notNull(),

    email: text('email').notNull(),

    password: text('password').notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true
    })
      .defaultNow()
      .notNull()
  },
  (t) => ({
    emailUnique: uniqueIndex('users_email_unique').on(t.email)
  })
);

import { db } from '../config/db';
import { users, posts } from '../db/schema';

async function seed() {
  const [user] = await db
    .insert(users)
    .values({ name: 'Test User' })
    .returning();

  await db.insert(posts).values([
    { userId: user.id, content: 'Hello world' },
    { userId: user.id, content: 'Second post' }
  ]);

  console.log('✅ Seed done');
}

seed();

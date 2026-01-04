import { db } from '../config/db';
import { users } from '../db/schema';

async function test() {
  const result = await db.select().from(users);
  console.log(result);
}

test();

import { db } from '../../config/db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signToken } from '../../utils/jwt';

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ) {
    const hashed = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashed
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email
      });

    const token = signToken({ userId: user.id });

    return { user, token };
  },

  async login(
    email: string,
    password: string
  ) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user)
      throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid)
      throw new Error('Invalid credentials');

    const token = signToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }
};

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET!,
  accessTokenExpiresIn: '7d'
};

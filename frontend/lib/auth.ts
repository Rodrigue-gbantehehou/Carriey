import NextAuth from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const auth = async () => {
  return getServerSession(authOptions);
};

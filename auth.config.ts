import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnNotes = nextUrl.pathname.startsWith('/notes');
      const isPublicBooking = nextUrl.pathname === '/book';
      if (isOnDashboard || isOnNotes) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to the sign-in page
      } else if (isLoggedIn && !isPublicBooking) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
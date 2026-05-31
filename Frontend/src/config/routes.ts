export const protectedRoutes = [
  '/',
  '/learning',
  '/projects',
  '/problems',
  '/playground',
  '/assignments',
  '/roadmap',
  '/certify',
  '/profile',
  '/settings',
  '/admin',
] as const;

export const publicRoutes = [
  '/login',
  '/register',
  '/lockscreen',
] as const;

export const adminRoutes = [
  '/admin',
] as const;

export const focusBlockedRoutes = [
  '/profile',
  '/settings',
  '/admin',
  '/playground',
] as const;

export type ProtectedRoute = typeof protectedRoutes[number];
export type PublicRoute = typeof publicRoutes[number];
export type AdminRoute = typeof adminRoutes[number];
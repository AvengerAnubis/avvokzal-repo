import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/profile',
  '/booking',
  '/payment',
  '/ticket',
  '/admin',
  '/operator',
  '/driver',
];

// Routes that require ADMIN role
const adminRoutes = [
  '/admin',
];

// Routes that require DRIVER role
const driverRoutes = [
  '/driver',
];

// Routes that require OPERATOR role
const operatorRoutes = [
  '/operator',
];

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const userJson = request.cookies.get('user')?.value;
  const pathname = request.nextUrl.pathname;

  // Get user role from cookie
  let userRole: string | null = null;
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      userRole = user?.role || null;
    } catch {
      userRole = null;
    }
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route));
  if (requiresAuth && !token) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if route requires ADMIN role
  const requiresAdmin = adminRoutes.some(route => pathname.startsWith(route));
  if (requiresAdmin && userRole !== 'ADMIN') {
    // Redirect to home if not admin
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if route requires DRIVER role
  const requiresDriver = driverRoutes.some(route => pathname.startsWith(route));
  if (requiresDriver && userRole !== 'DRIVER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if route requires OPERATOR role
  const requiresOperator = operatorRoutes.some(route => pathname.startsWith(route));
  if (requiresOperator && userRole !== 'OPERATOR') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
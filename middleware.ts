import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

// TEMPORARY: Disabled middleware to debug request hang
// export const config = {
//   matcher: ['/:path*'],
// };
export const config = {
  matcher: [], // Empty matcher disables middleware
};

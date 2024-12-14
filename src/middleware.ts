import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isApiRoute =
    request.nextUrl.pathname.startsWith("/api/dashboard/products") ||
    request.nextUrl.pathname.startsWith("/api/dashboard/categories") ||
    request.nextUrl.pathname.startsWith("/api/dashboard/subcategories");

  const token = await getToken({ req: request });

  if (isDashboardRoute && !token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isApiRoute && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/products/:path*",
    "/api/dashboard/categories/:path*",
    "/api/dashboard/subcategories/:path*",
  ],
};

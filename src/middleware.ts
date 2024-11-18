import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isApiRoute =
    request.nextUrl.pathname.startsWith("/api/products") ||
    request.nextUrl.pathname.startsWith("/api/categories") ||
    request.nextUrl.pathname.startsWith("/api/subcategories");

  const token = await getToken({ req: request });

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isApiRoute && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/subcategories/:path*",
  ],
};

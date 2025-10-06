import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import * as Sentry from "@sentry/nextjs";

export async function middleware(request: NextRequest) {
  try {
    const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
    const isApiRoute = request.nextUrl.pathname.startsWith("/api/dashboard/");

    const token = await getToken({ req: request });

    if (isDashboardRoute && !token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isApiRoute && !token) {
      return NextResponse.json(
        { error: "Неоторизиран достъп!" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Възникна грешка при обработка на заявката!" },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};

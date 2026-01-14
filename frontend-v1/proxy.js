import { NextResponse } from "next/server";
import { publicPaths } from "./app/store"; // Make sure this file is updated (see step 2)

const PUBLIC_PATHS = publicPaths;

export function proxy(request) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  // Updated check to support wildcards
  const isPublicPath = PUBLIC_PATHS.some((path) => {
    if (path.endsWith("/*")) {
      // This is a wildcard path, e.g., "/assets/*"
      // Get the base path, e.g., "/assets/"
      const basePath = path.slice(0, -1); // turns "/assets/*" into "/assets/"
      return pathname.startsWith(basePath);
    }
    // This is an exact path
    return path === pathname;
  });

  // Allow access to public routes
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If token exists, allow but add no-store header
  if (token) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  // Otherwise, redirect to login
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

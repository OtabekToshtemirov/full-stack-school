import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { routeAccessMap } from "./lib/settings";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    console.log("Middleware executed:", { pathname, hasToken: !!token, role: token?.role });

    // Agar user login qilgan bo'lsa va bosh sahifada bo'lsa, role asosida redirect qilish
    if (token && pathname === "/") {
      return NextResponse.redirect(new URL(`/${token.role}`, req.url));
    }

    // Role-based access control
    if (token?.role) {
      for (const [route, allowedRoles] of Object.entries(routeAccessMap)) {
        const routePattern = new RegExp(route.replace(/\.\*/g, ".*"));
        
        if (routePattern.test(pathname)) {
          if (!allowedRoles.includes(token.role as string)) {
            return NextResponse.redirect(new URL(`/${token.role}`, req.url));
          }
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        console.log("Authorized callback:", { pathname, hasToken: !!token });
        
        // API routes uchun ruxsat berish
        if (pathname.startsWith("/api")) {
          return true;
        }
        
        // Bosh sahifa uchun hamma uchun ruxsat
        if (pathname === "/") {
          return true;
        }
        
        // Protected routes uchun token talab qilish
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Protected routes - all routes except auth
    "/admin/:path*",
    "/teacher/:path*", 
    "/student/:path*",
    "/parent/:path*",
    "/list/:path*",
  ],
};

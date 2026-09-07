import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.

  //na me comment here
  const { data } = (supabase.auth as any).getClaims ? await (supabase.auth as any).getClaims() : await supabase.auth.getUser(); // Fallback for TS if getClaims is not typed
  const user = data?.claims || data?.user;

  const role = user?.user_metadata?.role || "patient";
  const isAdmin = role === "admin";

  const pathname = request.nextUrl.pathname;

  const isDoctorRoute = pathname.startsWith("/doctor");
  const isUserRoute = pathname.startsWith("/user");

  const isDoctorAuthRoute = pathname === "/doctor/login";
  const isUserAuthRoute =
    pathname.startsWith("/user/login") ||
    pathname.startsWith("/user/register") ||
    pathname.startsWith("/user/forgot-password") ||
    pathname.startsWith("/user/reset-password");

  const isDoctorProtectedRoute = isDoctorRoute && !isDoctorAuthRoute;
  const isUserProtectedRoute = isUserRoute && !isUserAuthRoute;

  // Unauthenticated users trying to access protected routes
  if (!user) {
    if (isDoctorProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/doctor/login";
      return NextResponse.redirect(url);
    }
    if (isUserProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/user/login";
      return NextResponse.redirect(url);
    }
  }

  // Authenticated users
  if (user) {
    // If they are on an auth route, redirect to their dashboard
    if (isDoctorAuthRoute || isUserAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? "/doctor/doctors-overview" : "/user/overview";
      return NextResponse.redirect(url);
    }

    // RBAC: Admin on patient route -> redirect to doctor dashboard
    if (isAdmin && isUserProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/doctor/doctors-overview";
      return NextResponse.redirect(url);
    }

    // RBAC: Patient on doctor route -> redirect to patient dashboard
    if (!isAdmin && isDoctorProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/user/overview";
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

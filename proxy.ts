import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "./lib/utils";
import prisma from "./lib/config/prisma";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    if (!hasEnvVars) return supabaseResponse;

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            // Inside updateSession setAll
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
            },
        },
    });

    // ***************************************************** //

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    const publicRoutes = ["/", "/about", "/support", "/auth/callback"];
    const visitorRoutes = ["/", "/sign-in", "/sign-up", "/verify-email"];

    const isPublic = publicRoutes.includes(path);
    const isVisitor = visitorRoutes.includes(path);
    const isOnboard = path === "/onboard";

    if (!user) {
        if (isPublic || isVisitor) return NextResponse.next();
        const url = request.nextUrl.clone();
        url.pathname = "/sign-in";
        return NextResponse.redirect(url);
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
    });

    if (!dbUser || !dbUser.role) {
        if (isOnboard) return supabaseResponse;

        const url = request.nextUrl.clone();
        url.pathname = "/onboard";
        return NextResponse.redirect(url);
    }

    const role = dbUser?.role;

    if (isVisitor && role) {
        const redirectTo = role === "CUSTOMER" ? "/customer" : role === "BUSINESS" ? "/business" : "/admin/dashboard";

        if (path !== redirectTo) {
            const url = request.nextUrl.clone();
            url.pathname = redirectTo;
            return NextResponse.redirect(url);
        }
        return NextResponse.next({ request });
    }

    const isCustomer = path.startsWith("/customer");
    const isBusiness = path.startsWith("/business");
    const isAdmin = path.startsWith("/admin");

    if (role === "CUSTOMER" && (isBusiness || isAdmin)) {
        const url = request.nextUrl.clone();
        url.pathname = "/customer";
        return NextResponse.redirect(url);
    }

    if (role === "BUSINESS" && (isCustomer || isAdmin)) {
        const url = request.nextUrl.clone();
        url.pathname = "/business";
        return NextResponse.redirect(url);
    }

    if (role === "ADMIN" && (isCustomer || isBusiness)) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
export const config = {
    matcher: [
        /* Exclude auth/callback and static files */
        "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

export async function proxy(request: NextRequest) {
    return await updateSession(request);
}

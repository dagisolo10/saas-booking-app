import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "./stack/server";
import prisma from "@/lib/config/prisma";

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    // ⛔ Don't run proxy logic on onboard route itself
    if (path === "/onboard") return NextResponse.next();

    const publicRoutes = ["/", "/about", "/support"];
    const visitorRoutes = ["/", "/sign-in", "/sign-up"];
    const isPublic = publicRoutes.includes(path);
    const isVisitor = visitorRoutes.includes(path);
    const isOnboard = path === "/onboard";

    const user = await stackServerApp.getUser().catch(() => null);

    if (!user && isPublic) return NextResponse.next();
    if (!user && !isPublic) return NextResponse.redirect(new URL("/", req.url));

    const dbUser = await prisma.user.findUnique({
        where: { id: user!.id },
        select: { role: true },
    });

    if (!dbUser && !isOnboard) return NextResponse.redirect(new URL("/onboard", req.url));
    if (dbUser && !dbUser.role && !isOnboard) return NextResponse.redirect(new URL("/onboard", req.url));

    const role = dbUser?.role;

    if (isVisitor && role) {
        const redirectTo = role === "CUSTOMER" ? "/customer" : role === "BUSINESS" ? "/business" : "/admin/dashboard";
        return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    const isCustomer = path.startsWith("/customer");
    const isBusiness = path.startsWith("/business");
    const isAdmin = path.startsWith("/admin");

    if (role === "CUSTOMER" && (isBusiness || isAdmin)) return NextResponse.redirect(new URL("/customer", req.url));
    if (role === "BUSINESS" && (isCustomer || isAdmin)) return NextResponse.redirect(new URL("/business", req.url));
    if (role === "ADMIN" && (isCustomer || isBusiness)) return NextResponse.redirect(new URL("/admin/dashboard", req.url));

    return NextResponse.next();
}

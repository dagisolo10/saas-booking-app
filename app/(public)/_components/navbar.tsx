import { stackServerApp } from "@/stack/server";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";

export default async function PublicsNavbar() {
    const user = await stackServerApp.getUser();

    const forAll = [
        { href: "/about", label: "About", isLoggedIn: true },
        { href: "/support", label: "Support", isLoggedIn: true },
        { href: "/sign-up", label: "Sign Up", isLoggedIn: false },
        { href: "/sign-in", label: "Sign In", isLoggedIn: false },
    ];
    const forLoggedIn = [
        { href: "/about", label: "About", isLoggedIn: true },
        { href: "/support", label: "Support", isLoggedIn: true },
    ];

    return (
        <header>
            <nav className="sticky top-0 flex items-center justify-center gap-6 p-4">
                {user
                    ? forLoggedIn.map((route) => (
                          <Link key={route.label} href={route.href}>
                              {route.label}
                          </Link>
                      ))
                    : forAll.map((route) => (
                          <Link key={route.label} href={route.href}>
                              {route.label}
                          </Link>
                      ))}
                <UserButton />
            </nav>
        </header>
    );
}

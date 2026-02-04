"use client";
import Link from "next/link";
import { useAuth } from "./auth-context";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export default function Navbar() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    function logout() {
        toast.promise(signOut, {
            loading: "Signing out...",
            success: "Logged Out",
            error: "Failed to signout",
        });
    }

    const hidden = ["/sign-in", "/sign-up", "/verify-email", "/onboard"];
    const isHidden = hidden.includes(pathname);

    if (isHidden) return null;

    return (
        <header className="px-8">
            <nav className="sticky top-0 flex items-center justify-between p-4">
                <Link className="text-xl font-extrabold tracking-wide md:text-2xl" href="/">
                    Bookly
                </Link>
                <div className="flex items-center gap-8 font-medium">
                    <Link href={`/customer`}>Customer</Link>
                    <Link href={`/business`}>Business</Link>
                    <Link href={`/support`}>Support</Link>
                    <Link href={`/about`}>About</Link>
                    <Link href={`/onboard`}>On Board</Link>
                    <Link href={`/sign-in`}>Sign In</Link>
                    <Link href={`/sign-up`}>Sign Up</Link>
                </div>
                <div className="flex items-center gap-4">
                    <h1>{user?.user_metadata.name ?? "Nothing"}</h1>
                    {user && (
                        <Button variant={`ghost`} onClick={logout}>
                            Logout
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
}

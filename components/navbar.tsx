"use client";
import Link from "next/link";
import { useAuth } from "./auth-context";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreditCard, LogOut, Settings, User, UserPlus, LogIn, HelpCircle } from "lucide-react";
import { checkUserExists } from "@/lib/config/auth";
import { Role } from "@prisma/client";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { user, signOut } = useAuth();
    const email = user?.email ?? "";
    const [role, setRole] = useState<Role | null>(null);

    const pathname = usePathname();
    const hidden = ["/sign-in", "/sign-up", "/verify-email", "/onboard"];
    const isHidden = hidden.includes(pathname);

    // Routes Definitions
    const adminRoutes = [{ label: "Admin Console", path: "/admin/dashboard" }];
    const businessRoutes = [{ label: "My Businesses", path: "/business/my-businesses" }];
    const customerRoutes = [
        { label: "Find Services", path: "/customer/services" },
        { label: "Browse Businesses", path: "/customer/businesses" },
        { label: "My Bookings", path: "/customer/bookings" },
    ];
    const visitorRoutes = [
        { label: "About", path: "/about" },
        { label: "Support", path: "/support" },
    ];

    const activeRoutes = role === "CUSTOMER" ? customerRoutes : role === "BUSINESS" ? businessRoutes : role === "ADMIN" ? adminRoutes : visitorRoutes;

    function logout() {
        toast.promise(signOut, { loading: "Signing out...", success: "Logged Out", error: "Failed to sign out" });
    }

    useEffect(() => {
        async function fetchRole() {
            if (user?.email) {
                try {
                    const dbUser = await checkUserExists(email);
                    setRole(dbUser?.role ?? null);
                } catch (error) {
                    console.error("Failed to fetch role:", error);
                }
            } else {
                setRole(null);
            }
        }
        fetchRole();
    }, [email, user]);

    if (isHidden) return null;

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 px-8 backdrop-blur-md">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between">
                <Link className="text-xl font-extrabold tracking-tight transition-opacity hover:opacity-80 md:text-2xl" href="/">
                    Bookly.
                </Link>

                <div className="flex items-center gap-2 font-medium">
                    {activeRoutes.map((route) => {
                        const isActive = pathname === route.path;
                        return (
                            <Button key={route.path} asChild className={isActive ? "bg-black text-white hover:bg-zinc-800" : "bg-transparent text-zinc-600 hover:bg-zinc-100"}>
                                <Link href={route.path}>{route.label}</Link>
                            </Button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <ProfileDropDown logout={logout} name={user?.user_metadata.name ?? ""} role={role} />
                </div>
            </nav>
        </header>
    );
}

interface DropDownProp {
    name: string;
    logout: () => void;
    role: Role | null;
}

export function ProfileDropDown({ name, logout, role }: DropDownProp) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`relative flex items-center gap-2 overflow-hidden transition-all ${name ? "pr-4" : "size-8 rounded-full p-0"}`}>
                    {name ? (
                        <>
                            <div className="flex size-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">{name.charAt(0).toUpperCase()}</div>
                            <span className="text-sm font-semibold">{name.split(" ")[0]}</span>
                        </>
                    ) : (
                        <User className="text-muted-foreground size-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 w-48">
                {name ? (
                    <>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm leading-none font-medium">{name}</p>
                                <p className="text-muted-foreground text-xs leading-none capitalize">{role?.toLowerCase() || "Guest"}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex cursor-pointer items-center">
                                <User className="mr-2 h-4 w-4" /> Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex cursor-pointer items-center">
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/billing" className="flex cursor-pointer items-center">
                                <CreditCard className="mr-2 h-4 w-4" /> Billing
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/support" className="flex cursor-pointer items-center">
                                <HelpCircle className="mr-2 h-4 w-4" /> Help Center
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" /> Log out
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuLabel>Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/sign-in" className="flex cursor-pointer items-center">
                                <LogIn className="mr-2 h-4 w-4" /> Sign In
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/sign-up" className="flex cursor-pointer items-center font-bold">
                                <UserPlus className="mr-2 h-4 w-4" /> Join Bookly
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/support" className="flex cursor-pointer items-center">
                                <HelpCircle className="mr-2 h-4 w-4" /> Help Center
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

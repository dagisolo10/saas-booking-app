import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import React from "react";

export default function AdminNavbar() {
    return (
        <header>
            <nav className="sticky top-0 flex items-center justify-center gap-6 p-4">
                <Link href={`/admin/dashboard`}>Dashboard</Link>
                <Link href={`/admin/businesses`}>Businesses</Link>
                <Link href={`/admin/users`}>Users</Link>
                <UserButton showUserInfo />
            </nav>
        </header>
    );
}

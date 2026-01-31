import { UserButton } from "@stackframe/stack";
import Link from "next/link";

export default function BusinessNavbar() {
    return (
        <header>
            <nav className="sticky top-0 flex items-center justify-center gap-6 p-4">
                <Link href={`/business/bookings`}>Bookings</Link>
                <Link href={`/business/dashboard`}>Dashboard</Link>
                <Link href={`/business/services`}>Services</Link>
                <Link href={`/business/settings`}>Settings</Link>
                <UserButton showUserInfo />
            </nav>
        </header>
    );
}

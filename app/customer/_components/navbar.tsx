import { UserButton } from "@stackframe/stack";
import Link from "next/link";

export default function CustomersNavbar() {
    return (
        <header>
            <nav className="sticky top-0 flex items-center justify-center gap-6 p-4">
                <Link href={`/customer/bookings`}>Bookings</Link>
                <Link href={`/customer/businesses`}>Businesses</Link>
                <Link href={`/customer/services`}>Services</Link>
                <UserButton showUserInfo />
            </nav>
        </header>
    );
}

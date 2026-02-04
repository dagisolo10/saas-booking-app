"use client";
import { useAuth } from "@/components/auth-context";

export default function Page() {
    const { user } = useAuth();

    return (
        <div>
            <h1>Get started</h1>
            <h2>{user?.email ?? "nothing"}</h2>
        </div>
    );
}

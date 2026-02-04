"use client";
import React, { SyntheticEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AuthMethod = "google" | "github";

export default function SignInForm() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const handleEmailAuth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        toast.promise(supabase.auth.signInWithPassword({ email, password }), {
            loading: "Signing in...",
            success: ({ error }) => {
                if (error) throw new Error(error.message);

                router.push("/onboard");
                return "Welcome Back!";
            },
            error: (err) => {
                setLoading(false);
                return err.message || "Failed to sign in";
            },
        });

        setLoading(false);
    };

    const handleOAuth = async (provider: AuthMethod) => {
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });

        if (error) throw error;

        router.push("/onboard");
    };

    return (
        <main className="flex min-h-screen w-full items-center justify-center border">
            <div className="max-w-md p-4">
                <h2 className="text-xl font-bold text-neutral-800">Welcome Back to Bookly</h2>
                <p className="mt-2 max-w-sm text-sm text-neutral-600">Sign in to manage your time, your bookings, and your business.</p>

                <form className="mt-8" onSubmit={handleEmailAuth}>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" placeholder="tylersmith@gmail.com" type="email" />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" placeholder="••••••••" type="password" />
                    </LabelInputContainer>

                    <Button disabled={loading} size={`lg`} className="w-full bg-zinc-900 font-medium transition-colors duration-300 hover:bg-zinc-800" type="submit">
                        Sign in &rarr;
                    </Button>

                    <div className="my-4 flex items-center gap-2 md:text-sm">
                        <p>Don&apos;t have an account?</p>
                        <Link href={`/sign-up`}>Sign Up</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:flex-row">
                        <Button type="button" disabled={loading} onClick={() => handleOAuth("github")} size={`lg`} className="bg-zinc-900 font-medium transition-colors duration-300 hover:bg-zinc-800">
                            <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">GitHub</span>
                        </Button>
                        <Button type="button" disabled={loading} onClick={() => handleOAuth("google")} size={`lg`} className="bg-zinc-900 font-medium transition-colors duration-300 hover:bg-zinc-800">
                            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">Google</span>
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};

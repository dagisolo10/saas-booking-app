"use client";
import { useState } from "react";
import React, { SyntheticEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkUserExists } from "@/lib/config/auth";

type AuthMethod = "google" | "github";

export default function SignupForm() {
    const supabase = createClient();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleEmailAuth = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = `${formData.get("first-name")} ${formData.get("last-name")}`;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // 1. Check if they already exist in your DB
        const exists = await checkUserExists(email);

        if (exists) {
            toast.error("An account with this email already exists. Try signing in!");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success("Check your email for the confirmation link.");
            router.push("/verify-email");
        }
    };

    const handleOAuth = async (provider: AuthMethod) => {
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });

        if (error) throw error;

        router.push("/onboard");
    };

    return (
        <main className="flex min-h-screen w-full items-center justify-center border">
            <div className="max-w-md p-4">
                <h2 className="text-xl font-bold text-neutral-800">Welcome to Bookly</h2>
                <p className="mt-2 mb-4 max-w-sm text-sm text-neutral-600">Join Bookly to simplify your scheduling and handle reservations, clients, and your daily flow.</p>

                <form className="mt-4" onSubmit={handleEmailAuth}>
                    <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                        <LabelInputContainer>
                            <Label htmlFor="first-name">First name</Label>
                            <Input id="first-name" name="first-name" placeholder="Tyler" type="text" />
                        </LabelInputContainer>
                        <LabelInputContainer>
                            <Label htmlFor="last-name">Last name</Label>
                            <Input id="last-name" name="last-name" placeholder="Smith" type="text" />
                        </LabelInputContainer>
                    </div>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" placeholder="tylersmith@gmail.com" type="email" />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" placeholder="••••••••" type="password" />
                    </LabelInputContainer>

                    <Button disabled={loading} size={`lg`} className="w-full bg-zinc-900 font-medium transition-colors duration-300 hover:bg-zinc-800" type="submit">
                        Sign up &rarr;
                    </Button>

                    <div className="my-4 flex items-center gap-2 md:text-sm">
                        <p>Already have an account?</p>
                        <Link href={`/sign-in`}>Sign In</Link>
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

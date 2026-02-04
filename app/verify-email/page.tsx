import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// app/verify-email/page.tsx
export default function VerifyEmailPage() {
    return (
        <main className="flex min-h-screen items-center justify-center">
            <Card className="p-6 text-center">
                <CardTitle className="text-2xl">Check your inbox!</CardTitle>
                {/* className="mt-2 max-w-md text-neutral-600" */}
                <CardDescription className="max-w-md">We&apos;ve sent a verification link to your email. Please click the link to verify your account and continue to onboarding.</CardDescription>
                <div className="mt-4 text-sm text-neutral-500">
                    <span>Didn&apos;t get the email? Check your spam folder or </span>
                    <Link href="/sign-up" className="underline">
                        try again
                    </Link>
                </div>
            </Card>
        </main>
    );
}

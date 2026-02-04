import { redirect } from "next/navigation";
import RoleForm from "@/app/onboard/_components/role-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/config/prisma";

import { createClient } from "@/lib/supabase/server";

export default async function Onboard() {
    const supabase = await createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) return redirect("/sign-in");

    let dbUser = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
    });

    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                name: user.user_metadata.name,
                email: user.email ?? "",
            },
        });
    }

    const role = dbUser.role;

    if (role) {
        const redirectTo = role === "CUSTOMER" ? "/customer" : role === "BUSINESS" ? "/business" : "/admin/dashboard";
        return redirect(redirectTo);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-2">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome, {dbUser.name}!</CardTitle>
                    <CardDescription>Before we get started, tell us how you’ll be using the app.</CardDescription>
                    <CardDescription>Choose your role below — this helps us set up your experience properly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RoleForm />
                </CardContent>
                <CardFooter>
                    <CardDescription>You can always change this later from your profile settings.</CardDescription>
                </CardFooter>
            </Card>
        </main>
    );
}

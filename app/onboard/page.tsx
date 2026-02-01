import { redirect } from "next/navigation";
import RoleForm from "@/app/onboard/_components/role-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/config/prisma";
import { UserButton } from "@stackframe/stack";

export default async function Onboard() {
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) return redirect("/");

    let user = await prisma.user.findUnique({ where: { id: stackUser.id } });

    if (!user) {
        user = await prisma.user.create({
            data: { id: stackUser.id, name: stackUser.displayName, email: stackUser.primaryEmail ?? "" },
        });
    }

    const role = user.role;

    if (role) {
        const redirectTo = role === "CUSTOMER" ? "/customer" : role === "BUSINESS" ? "/business" : "/admin/dashboard";
        return redirect(redirectTo);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-2">
            <Card className="w-full max-w-md">
                <UserButton />
                <CardHeader>
                    <CardTitle>Welcome, {stackUser?.displayName}!</CardTitle>
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

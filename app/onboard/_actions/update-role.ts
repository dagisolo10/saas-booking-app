"use server";
import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";

type UserRole = "CUSTOMER" | "ADMIN" | "BUSINESS";

export default async function updateRole({ role }: { role: UserRole }) {
    const user = await stackServerApp.getUser();

    if (!user) return;

    return await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            role,
        },
    });
}

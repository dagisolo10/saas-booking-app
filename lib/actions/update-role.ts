"use server";
import { stackServerApp } from "@/stack/server";
import prisma from "../config/prisma";

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

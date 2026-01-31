"use server";
import prisma from "../config/prisma";
import { stackServerApp } from "@/stack/server";

export default async function getUser() {
    const user = await stackServerApp.getUser();

    if (!user) return null;

    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                name: user.displayName,
                email: user.primaryEmail ?? "",
            },
        });
    }

    return dbUser;
}

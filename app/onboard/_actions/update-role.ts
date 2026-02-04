"use server";
import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";

type UserRole = "CUSTOMER" | "ADMIN" | "BUSINESS";

export default async function updateRole(role: UserRole) {
    const supabase = createClient();
    const {
        data: { user },
    } = await (await supabase).auth.getUser();

    console.log(user);
    console.log(role);

    if (!user) return;

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            role,
        },
    });
}

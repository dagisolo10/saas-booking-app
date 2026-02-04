"use server";
import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getMyBusinesses() {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

        return await prisma.business.findMany({
            where: {
                ownerId: user?.id,
            },
            include: {
                services: true,
            },
        });
    } catch (error) {
        console.log("Error in deleteBusiness:", error);
        return { error: true, message: "Something went wrong deleting business" };
    }
}

export async function getMyBusinessById(id: string) {
    const supabase = createClient();
    const {
        data: { session },
    } = await (await supabase).auth.getSession();

    const user = session?.user;

    return await prisma.business.findFirst({
        where: {
            id,
            ownerId: user?.id,
        },
        include: {
            services: true,
        },
    });
}

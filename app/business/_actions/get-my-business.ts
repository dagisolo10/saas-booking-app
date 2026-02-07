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

        if (!user) return { error: true, message: "Unauthorized" };

        return await prisma.business.findMany({
            where: {
                ownerId: user?.id,
            },
            include: {
                services: true,
            },
        });
    } catch (error) {
        console.log("Error in getMyBusinesses:", error);
        return { error: true, message: "Something went wrong fetching my businesses" };
    }
}

export async function getMyBusinessById(id: string) {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        return await prisma.business.findFirst({
            where: {
                id,
                ownerId: user?.id,
            },
            include: {
                services: true,
            },
        });
    } catch (error) {
        console.log("Error in getMyBusinessById:", error);
        return { error: true, message: "Something went wrong fetching my business" };
    }
}

export async function getMyTopBusinesses() {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        return await prisma.business.findMany({
            where: {
                ownerId: user?.id,
            },
            orderBy: {
                rating: "desc",
            },
            include: {
                services: true,
            },
            take: 8,
        });
    } catch (error) {
        console.log("Error in getTopBusinesses:", error);
        return { error: true, message: "Something went wrong fetching my top businesses" };
    }
}

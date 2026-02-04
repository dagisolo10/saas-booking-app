"use server";

import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";

interface ServiceCreation {
    name: string;
    duration: number;
    price: number;
    businessId: string;
    thumbnail: string;
    category: string;
}

export default async function createService({ name, duration, price, businessId, thumbnail, category }: ServiceCreation) {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const existingService = await prisma.service.findFirst({
            where: {
                businessId,
                name,
                business: {
                    ownerId: user.id,
                },
            },
        });

        if (existingService) return { error: true, message: "Service with that name already exists" };

        const service = await prisma.service.create({
            data: {
                name,
                duration,
                price,
                businessId,
                thumbnail,
                category,
            },
        });

        return service;
    } catch (error) {
        console.log("Error in createService:", error);
        return { error: true, message: "Something went wrong creating service" };
    }
}

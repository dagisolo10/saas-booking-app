"use server";

import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

        const business = await prisma.business.findUnique({ where: { id: businessId, ownerId: user.id } });

        if (!business) return { error: true, message: "Business not found or not owned by you" };

        if (business.status !== "ACTIVE") return { error: true, message: "You must activate your business to add new services." };

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

        revalidatePath(`/business/my-businesses/${service.businessId}`);
        return service;
    } catch (error) {
        console.log("Error in createService:", error);
        return { error: true, message: "Something went wrong creating service" };
    }
}

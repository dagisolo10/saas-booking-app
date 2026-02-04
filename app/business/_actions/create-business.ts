"use server";
import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";

interface BusinessCreation {
    name: string;
    phone?: string;
    location?: string;
    description?: string;
    bannerImages: string[];
    hours: Prisma.InputJsonObject;
}

export default async function createBusiness({ name, phone, location, description, bannerImages, hours }: BusinessCreation) {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const existingBusiness = await prisma.business.findFirst({
            where: {
                ownerId: user.id,
                name,
            },
        });

        if (existingBusiness) return { error: true, message: "Business with this name already exists in your account." };

        const business = await prisma.business.create({
            data: {
                ownerId: user.id,
                name,
                hours,
                phone,
                location,
                description,
                bannerImages,
            },
            include: {
                services: true,
            },
        });

        return business;
    } catch (error) {
        console.log("Error in createBusiness:", error);
        return { error: true, message: "Something went wrong creating business" };
    }
}

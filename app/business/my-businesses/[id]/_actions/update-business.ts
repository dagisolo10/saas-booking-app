"use server";

import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";

interface BusinessUpdate {
    name: string;
    phone: string;
    location: string;
    businessId: string;
    timeZone: string;
    description: string;
    bannerImages: string[];
    hours: Prisma.InputJsonObject;
}

interface PartialData {
    name: string;
    phone: string;
    location: string;
    timeZone: string;
    description: string;
    bannerImages: string[];
    hours: Prisma.InputJsonObject;
}

export default async function updateBusiness({ name, phone, location, description, timeZone, bannerImages, hours, businessId }: BusinessUpdate) {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                ownerId: user.id,
            },
        });

        if (!business) return { error: true, message: "Business not found or not owned by you" };

        const data: Partial<PartialData> = {};
        if (name !== undefined) data.name = name;
        if (hours !== undefined) data.hours = hours;
        if (phone !== undefined) data.phone = phone;
        if (location !== undefined) data.location = location;
        if (timeZone !== undefined) data.timeZone = timeZone;
        if (description !== undefined) data.description = description;
        data.bannerImages = bannerImages;

        const updatedBusiness = await prisma.business.update({
            where: {
                id: businessId,
            },
            data,
        });

        return updatedBusiness;
    } catch (error) {
        console.log("Error in updateBusiness:", error);
        return { error: true, message: "Something went wrong updating business" };
    }
}

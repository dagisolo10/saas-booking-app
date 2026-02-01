"use server";

import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";
import { Prisma } from "@prisma/client";

interface BusinessUpdate {
    name?: string;
    hours?: Prisma.InputJsonObject;
    businessId: string;
}

export default async function updateBusiness({ name, hours, businessId }: BusinessUpdate) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const business = await prisma.business.findUnique({
            where: {
                id: businessId,
            },
        });

        if (!business) return { error: true, message: "Business not found or not owned by you" };

        const data: Partial<{ name: string; hours: Prisma.InputJsonObject }> = {};
        if (name !== undefined) data.name = name;
        if (hours !== undefined) data.hours = hours;

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

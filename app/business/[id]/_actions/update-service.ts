"use server";

import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";

interface ServiceUpdate {
    name?: string;
    duration?: number;
    price?: number;
    serviceId: string;
}

export default async function updateService({ name, duration, price, serviceId }: ServiceUpdate) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const service = await prisma.service.findUnique({
            where: {
                id: serviceId,
                business: {
                    ownerId: user.id,
                },
            },
        });

        if (!service) return { error: true, message: "Service not found or not in your business" };

        const data: Partial<{ name: string; duration: number; price: number }> = {};

        if (name !== undefined) data.name = name;
        if (duration !== undefined) data.duration = duration;
        if (price !== undefined) data.price = price;

        const updatedService = await prisma.service.update({
            where: {
                id: serviceId,
            },
            data,
        });

        return updatedService;
    } catch (error) {
        console.log("Error in updateService:", error);
        return { error: true, message: "Something went wrong updating service" };
    }
}

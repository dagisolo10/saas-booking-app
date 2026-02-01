"use server";

import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";

interface ServiceCreation {
    name: string;
    duration: number;
    price: number;
    businessId: string;
}

export default async function createService({ name, duration, price, businessId }: ServiceCreation) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const existingService = await prisma.service.findFirst({
            where: {
                businessId,
                name,
            },
        });

        if (existingService) {
            return { error: true, message: "Service with that name already exists" };
        }

        const service = await prisma.service.create({
            data: {
                name,
                duration,
                price,
                businessId,
            },
        });

        return service;
    } catch (error) {
        console.log("Error in createService:", error);
        return { error: true, message: "Something went wrong creating service" };
    }
}

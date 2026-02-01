"use server";

import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";
import { Prisma } from "@prisma/client";

interface BusinessCreation {
    name: string;
    hours: Prisma.InputJsonObject;
}

export default async function createBusiness({ name, hours }: BusinessCreation) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const existingBusiness = await prisma.business.findFirst({
            where: {
                ownerId: user.id,
                name,
            },
        });

        if (existingBusiness) {
            return { error: true, message: "Business with this name already exists in your account." };
        }

        const business = await prisma.business.create({
            data: {
                ownerId: user.id,
                name,
                hours: hours,
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

"use server";

import prisma from "@/lib/config/prisma";

export async function getAllBusinesses() {
    try {
        return await prisma.business.findMany({
            include: {
                services: true,
            },
        });
    } catch (error) {
        console.log("Error in deleteBusiness:", error);
        return { error: true, message: "Something went wrong deleting business" };
    }
}

export async function getBusinessById(id: string) {
    return await prisma.business.findUnique({
        where: {
            id,
        },
        include: {
            services: true,
        },
    });
}

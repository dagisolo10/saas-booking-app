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
        console.log("Error in getAllBusinesses:", error);
        return { error: true, message: "Something went wrong deleting business" };
    }
}

export async function getTopBusinesses() {
    try {
        return await prisma.business.findMany({
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
        return { error: true, message: "Something went wrong fetching top businesses" };
    }
}

export async function getBusinessById(id: string) {
    try {
        return await prisma.business.findUnique({
            where: {
                id,
            },
            include: {
                services: true,
            },
        });
    } catch (error) {
        console.log("Error in getBusinessById:", error);
        return { error: true, message: "Something went wrong fetching a business" };
    }
}

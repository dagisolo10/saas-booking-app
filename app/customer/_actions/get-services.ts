"use server";
import prisma from "@/lib/config/prisma";

export async function getAllServices() {
    try {
        return await prisma.service.findMany({});
    } catch (error) {
        console.log("Error in getAllServices:", error);
        return { error: true, message: "Something went wrong fetching all services" };
    }
}

export async function getTopServices() {
    try {
        return await prisma.service.findMany({
            orderBy: {
                rating: "desc",
            },
            include: {
                business: true,
            },
            take: 8,
        });
    } catch (error) {
        console.log("Error in getTopServices:", error);
        return { error: true, message: "Something went wrong fetching top services" };
    }
}

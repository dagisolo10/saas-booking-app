"use server";

import prisma from "@/lib/config/prisma";

export async function getTopServices() {
    const services = await prisma.service.findMany({
        orderBy: {
            rating: "desc",
        },
        include: {
            business: true,
        },
        take: 8,
    });

    return services;
}

export async function getAllServices() {
    const services = await prisma.service.findMany({});

    return services;
}

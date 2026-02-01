"use server";

import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";

export default async function deleteService({ serviceId }: { serviceId: string }) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                business: {
                    ownerId: user.id,
                },
            },
        });

        if (!service) return { error: true, message: "Service not found or you don’t have permission to delete it." };

        await prisma.booking.deleteMany({
            where: {
                serviceId,
            },
        });

        await prisma.service.delete({
            where: {
                id: serviceId,
            },
        });

        return { success: true };
    } catch (error) {
        console.log("Error in deleteService:", error);
        return { error: true, message: "Something went wrong deleting service" };
    }
}

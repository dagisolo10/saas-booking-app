"use server";

import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";

export default async function deleteBusiness({ businessId }: { businessId: string }) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const business = await prisma.business.findUnique({
            where: {
                id: businessId,
                ownerId: user.id,
            },
        });

        if (!business) return { error: true, message: "Business not found or not owned by you" };

        // delete bookings of the service in the business
        const booking = await prisma.booking.deleteMany({
            where: {
                service: {
                    businessId,
                },
            },
        });

        if (booking.count === 0) return { error: true, message: "Booking in this business not found" };

        // delete the services in that business
        const service = await prisma.service.deleteMany({
            where: {
                businessId,
            },
        });

        if (service.count === 0) return { error: true, message: "Service in this business not found" };

        // then delete the business
        await prisma.business.delete({
            where: {
                id: businessId,
            },
        });

        return { success: true };
    } catch (error) {
        console.log("Error in deleteBusiness:", error);
        return { error: true, message: "Something went wrong deleting business" };
    }
}

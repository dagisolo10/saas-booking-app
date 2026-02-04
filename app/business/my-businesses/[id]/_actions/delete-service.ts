"use server";

import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function deleteService({ serviceId }: { serviceId: string }) {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const activeBookings = await prisma.booking.findFirst({
            where: {
                serviceId,
                status: "CONFIRMED",
            },
        });

        if (activeBookings) return { error: true, message: "Cannot delete service with active bookings" };

        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                business: {
                    ownerId: user.id,
                },
            },
        });

        if (!service) return { error: true, message: "Service not found or you don’t have permission to delete it." };

        await prisma.$transaction(async (trx) => {
            await trx.booking.deleteMany({
                where: {
                    serviceId,
                },
            });

            await trx.service.delete({
                where: {
                    id: serviceId,
                },
            });
        });

        return { success: true };
    } catch (error) {
        console.log("Error in deleteService:", error);
        return { error: true, message: "Something went wrong deleting service" };
    }
}

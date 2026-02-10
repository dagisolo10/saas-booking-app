"use server";

import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function deleteService(serviceId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const activeBookings = await prisma.booking.findFirst({
            where: {
                service: {
                    business: {
                        ownerId: user.id,
                    },
                },
                serviceId,
                status: "CONFIRMED",
            },
        });

        if (activeBookings) return { error: true, message: "Can not delete service with active bookings" };

        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                business: {
                    ownerId: user.id,
                },
            },
            include: {
                business: true,
            },
        });

        if (!service) return { error: true, message: "Service not found or you don’t have permission to delete it." };

        if (service.business.status === "CLOSED") return { error: true, message: "Cannot modify services of a closed business." };

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

        if (service.thumbnail) {
            try {
                const decodedUrl = decodeURIComponent(service.thumbnail);
                const parts = decodedUrl.split("/banners/");
                const path = parts[parts.length - 1];

                const cleanPath = path.startsWith("/") ? path.substring(1) : path;

                await supabase.storage.from("services").remove([cleanPath]);
            } catch (e) {
                return { error: true, message: `Failed to delete service thumbnail:${e}` };
            }
        }

        revalidatePath(`/business/my-businesses/${service.businessId}`);

        return { success: true };
    } catch (error) {
        console.log("Error in deleteService:", error);
        return { error: true, message: "Something went wrong deleting service" };
    }
}

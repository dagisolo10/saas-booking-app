"use server";

import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";

interface BookingManagement {
    bookingId: string;
}

export default async function cancelBooking({ bookingId }: BookingManagement) {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId: user.id,
            },
        });

        if (!booking) return { error: true, message: "Booking not found" };
        if (booking.status === "CANCELLED") return { error: true, message: "Already cancelled" };

        const service = await prisma.service.findFirst({
            where: {
                id: booking.serviceId,
            },
        });

        if (!service) return { error: true, message: "Service not found" };

        await prisma.$transaction(async (trx) => {
            if (booking.status === "CONFIRMED" || booking.status === "PENDING") {
                await trx.service.update({
                    where: {
                        id: booking.serviceId,
                    },
                    data: {
                        activeBookings: {
                            decrement: 1,
                        },
                    },
                });
            }
            await trx.booking.update({
                where: {
                    id: bookingId,
                },
                data: {
                    status: "CANCELLED",
                },
            });
        });

        return { success: true };
    } catch (error) {
        console.log("Error in cancelBooking:", error);
        return { error: true, message: "Something went wrong canceling booking" };
    }
}

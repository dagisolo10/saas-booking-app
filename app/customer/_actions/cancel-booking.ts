"use server";

import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";

interface BookingManagement {
    bookingId: string;
}

export default async function cancelBooking({ bookingId }: BookingManagement) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId: user.id,
            },
        });

        if (!booking) {
            return { error: true, message: "Booking not found" };
        }

        await prisma.booking.update({
            where: {
                id: bookingId,
            },
            data: {
                status: "CANCELLED",
            },
        });

        return { success: true };
    } catch (error) {
        console.log("Error in cancelBooking:", error);
        return { error: true, message: "Something went wrong canceling booking" };
    }
}

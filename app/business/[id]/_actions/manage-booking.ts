"use server";

import prisma from "@/lib/config/prisma";
import { stackServerApp } from "@/stack/server";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

interface BookingManagement {
    status: BookingStatus;
    bookingId: string;
}

export default async function manageBooking({ status, bookingId }: BookingManagement) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId,
                service: {
                    business: {
                        ownerId: user.id,
                    },
                },
            },
        });

        if (!booking) {
            return { error: true, message: "Booking not found" };
        }

        const updatedBooking = await prisma.booking.update({
            where: {
                id: bookingId,
            },
            data: {
                status,
            },
        });

        return updatedBooking;
    } catch (error) {
        console.log("Error in manageBooking:", error);
        return { error: true, message: "Something went wrong managing booking" };
    }
}

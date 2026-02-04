"use server";

import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

interface BookingManagement {
    newStatus: BookingStatus;
    bookingId: string;
}

export default async function manageBooking({ newStatus, bookingId }: BookingManagement) {
    try {
        const supabase = createClient();
        const {
            data: { session },
        } = await (await supabase).auth.getSession();

        const user = session?.user;

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

        if (!booking) return { error: true, message: "Booking not found" };

        if (booking.status === newStatus) return booking;

        return await prisma.$transaction(async (trx) => {
            // CONFIRMATION
            // from pending/cancelled -> confirmed
            if ((booking.status === "PENDING" || booking.status === "CANCELLED") && newStatus === "CONFIRMED") {
                await trx.service.update({
                    where: {
                        id: booking.serviceId,
                    },
                    data: {
                        activeBookings: {
                            increment: 1,
                        },
                    },
                });
            }

            // CANCELLATION
            // from confirmed -> cancelled
            if (booking.status === "CONFIRMED" && newStatus === "CANCELLED") {
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

            // COMPLETION
            // from confirmed -> completed || from pending -> completed
            if (newStatus === "COMPLETED") {
                await trx.service.update({
                    where: {
                        id: booking.serviceId,
                    },
                    data: {
                        totalCompleted: {
                            increment: 1,
                        },
                        ...(booking.status === "CONFIRMED" && {
                            activeBookings: {
                                decrement: 1,
                            },
                        }),
                    },
                });
            }

            return await trx.booking.update({
                where: {
                    id: bookingId,
                },
                data: {
                    status: newStatus,
                },
            });
        });
    } catch (error) {
        console.log("Error in manageBooking:", error);
        return { error: true, message: "Something went wrong managing booking" };
    }
}

"use server";
import prisma from "@/lib/config/prisma";
import { getWeekday, hasEnoughTime, isBusinessOpen } from "@/lib/helpers/working-hour";
import { BusinessHours } from "@/lib/types";
import { stackServerApp } from "@/stack/server";

interface BookingUpdate {
    date: Date;
    serviceId: string;
    bookingId: string;
    businessId: string;
}

export default async function updateBooking({ date, bookingId }: BookingUpdate) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "Unauthorized" };

        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId: user.id,
            },
            include: {
                service: {
                    select: {
                        duration: true,
                        business: {
                            select: {
                                hours: true,
                            },
                        },
                    },
                },
            },
        });

        if (!booking) return { error: true, message: "Booking not found" };

        const now = new Date();
        if (new Date(booking.date) < now) return { error: true, message: "You can’t reschedule a past booking." };

        if (new Date(date) < now) return { error: true, message: "You can’t choose a past time." };

        const conflicts = await prisma.booking.findFirst({
            where: {
                userId: user.id,
                id: {
                    not: bookingId,
                },
                date,
            },
        });

        if (conflicts) return { error: true, message: "You already have another booking at that time." };

        const bookingDate = date.toISOString();
        const weekDay = getWeekday(bookingDate);
        const hours = booking.service.business.hours as BusinessHours;

        const isOpen = isBusinessOpen(hours, weekDay, bookingDate);

        if (!isOpen)
            return {
                error: true,
                message: "This business is closed during the selected time. Please pick another slot.",
            };

        const enoughTime = hasEnoughTime(hours, weekDay, bookingDate, booking.service.duration);

        if (!enoughTime)
            return {
                error: true,
                message: "The selected time doesn’t leave enough time before closing. Please choose an earlier slot.",
            };

        const updatedBooking = await prisma.booking.update({
            where: {
                id: bookingId,
            },
            data: {
                date: bookingDate,
                status: "PENDING",
            },
            include: {
                service: true,
            },
        });

        return updatedBooking;
    } catch (error) {
        console.log("Error in updateBooking:", error);
        return { error: true, message: "Something went wrong updating booking" };
    }
}

// Rescheduling only (change date/time, not service).

// Prevent rescheduling past bookings or within too close to start time (optional).

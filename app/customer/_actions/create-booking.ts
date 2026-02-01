"use server";

import prisma from "@/lib/config/prisma";
import { getWeekday, hasEnoughTime, isBusinessOpen } from "@/lib/helpers/working-hour";
import { BusinessHours } from "@/lib/types";
import { stackServerApp } from "@/stack/server";

interface BookingCreation {
    date: Date;
    serviceId: string;
    businessId: string;
}

export default async function createBooking({ businessId, serviceId, date }: BookingCreation) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) return { error: true, message: "You must be signed in to make a booking." };

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { bookings: true },
        });

        // 🖋️ Check if user already has a booking at that *exact* time
        const isAlreadyTaken = dbUser?.bookings.some((booking) => new Date(booking.date).getTime() === new Date(date).getTime());

        if (isAlreadyTaken) {
            return {
                error: true,
                message: "You already have a booking scheduled at this exact time.",
            };
        }

        // 🖋️ Validate business
        const business = await prisma.business.findUnique({
            where: { id: businessId },
        });

        if (!business) return { error: true, message: "The selected business could not be found." };

        // 🖋️ Validate service
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) return { error: true, message: "The selected service could not be found." };

        if (!service.duration) return { error: true, message: "This service has an invalid or missing duration." };

        // 🖋️ Working hours logic
        const bookingDate = date.toISOString();
        const weekDay = getWeekday(bookingDate);

        const isOpen = isBusinessOpen(business.hours as BusinessHours, weekDay, bookingDate);
        if (!isOpen)
            return {
                error: true,
                message: "This business is closed during the selected time. Please pick another slot.",
            };

        const enoughTime = hasEnoughTime(business.hours as BusinessHours, weekDay, bookingDate, service.duration);
        if (!enoughTime)
            return {
                error: true,
                message: "The selected time doesn’t leave enough time before closing. Please choose an earlier slot.",
            };

        // 🖋️ Everything valid — create booking
        const booking = await prisma.booking.create({
            data: {
                userId: user.id,
                date: bookingDate,
                serviceId,
            },
            include: { service: true },
        });

        return booking;
    } catch (error) {
        console.error("Error in createBooking:", error);
        return {
            error: true,
            message: "An unexpected error occurred while creating your booking. Please try again.",
        };
    }
}

// check for booking at that date ✅
// check if the date is in the working our of the business
// check for overlapping booking (the duration of the service)

// (Optional) Edge case: multiple bookings on same day for different services at different times
// Later, you’ll probably want to extend your “already taken” check to see if the new booking overlaps
// an existing one rather than just having the exact same timestamp.
//

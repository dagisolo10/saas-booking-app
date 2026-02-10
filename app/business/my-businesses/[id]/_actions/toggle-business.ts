"use server";
import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function toggleBusiness({ businessId }: { businessId: string }) {
    try {
        const supabase = await createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const business = await prisma.business.findFirst({
            where: { id: businessId, ownerId: user.id },
        });

        if (!business) return { error: true, message: "Business not found or not owned by you" };

        if (business.status === "CLOSED") return { error: true, message: "Closed businesses cannot be toggled." };

        const newStatus = business.status === "PAUSED" ? "ACTIVE" : "PAUSED";

        if (newStatus === "PAUSED") {
            const activeBookings = await prisma.booking.findFirst({
                where: {
                    service: { businessId },
                    status: "CONFIRMED",
                },
            });

            if (activeBookings) return { error: true, message: "Cannot pause business with active bookings" };

            await prisma.$transaction([
                prisma.booking.updateMany({
                    where: {
                        service: { businessId },
                        status: "PENDING",
                    },
                    data: { status: "CANCELLED" },
                }),
                prisma.business.update({
                    where: { id: businessId },
                    data: { status: newStatus },
                }),
            ]);
        } else {
            await prisma.business.update({
                where: { id: businessId },
                data: { status: newStatus },
            });
        }

        revalidatePath("/business/my-businesses");

        return { success: true, status: newStatus };
    } catch (error) {
        console.log("Error in toggleBusiness:", error);
        return { error: true, message: "Something went wrong pausing business" };
    }
}

"use server";
import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function closeBusiness({ businessId }: { businessId: string }) {
    try {
        const supabase = await createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                ownerId: user.id,
            },
        });

        if (!business) return { error: true, message: "Business not found or not owned by you" };

        const activeBookings = await prisma.booking.findFirst({
            where: {
                service: { businessId },
                status: "CONFIRMED",
            },
        });

        if (activeBookings) return { error: true, message: "Can not close business with active bookings. Please complete or cancel them first." };

        const services = await prisma.service.findMany({
            where: { businessId },
            select: { thumbnail: true },
        });

        const thumbnailPaths = services
            .filter((s) => s.thumbnail)
            .map((s) => {
                try {
                    const decodedUrl = decodeURIComponent(s.thumbnail!);
                    const parts = decodedUrl.split("/banners/");
                    const path = parts[parts.length - 1];
                    return path.startsWith("/") ? path.substring(1) : path;
                } catch {
                    return null;
                }
            })
            .filter(Boolean) as string[];
       
            const bannerPaths = business.bannerImages
            .map((url) => {
                try {
                    const decodedUrl = decodeURIComponent(url!);
                    const parts = decodedUrl.split("/banners/");
                    const path = parts[parts.length - 1];
                    return path.startsWith("/") ? path.substring(1) : path;
                } catch {
                    return null;
                }
            })
            .filter(Boolean) as string[];

        await prisma.$transaction([
            prisma.booking.updateMany({
                where: {
                    service: { businessId },
                    status: "PENDING",
                },
                data: { status: "CANCELLED" },
            }),
            prisma.service.deleteMany({
                where: { businessId },
            }),
            prisma.business.update({
                where: { id: businessId },
                data: { status: "CLOSED", bannerImages: [] },
            }),
        ]);

        if (thumbnailPaths.length > 0) {
            const { error: storageError } = await supabase.storage.from("banners").remove(thumbnailPaths);

            if (storageError) return { error: true, message: storageError.message };
        }

        if (bannerPaths.length > 0) {
            const { error: storageError } = await supabase.storage.from("banners").remove(bannerPaths);

            if (storageError) return { error: true, message: storageError.message };
        }

        return { success: true };
    } catch (error) {
        console.log("Error in closeBusiness:", error);
        return { error: true, message: "Something went wrong closing business" };
    }
}

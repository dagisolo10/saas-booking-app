"use server";
import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ServiceUpdate {
    name?: string;
    duration?: number;
    price?: number;
    serviceId: string;
    thumbnail: string;
    category: string;
}
interface PartialServiceUpdate {
    name?: string;
    duration?: number;
    price?: number;
    thumbnail: string;
    category: string;
}

export default async function updateService({ name, duration, price, thumbnail, category, serviceId }: ServiceUpdate) {
    try {
        const supabase = await createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const service = await prisma.service.findUnique({
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

        if (!service) return { error: true, message: "Service not found or not in your business" };

        if (service.business.status === "CLOSED") return { error: true, message: "Cannot modify services of a closed business." };

        const data: Partial<PartialServiceUpdate> = {};

        if (name !== undefined) data.name = name;
        if (duration !== undefined) data.duration = duration;
        if (price !== undefined) data.price = price;
        if (thumbnail !== undefined) data.thumbnail = thumbnail;
        if (category !== undefined) data.category = category;

        const updatedService = await prisma.service.update({
            where: {
                id: serviceId,
            },
            data,
        });

        if (thumbnail !== undefined && thumbnail !== service.thumbnail && service.thumbnail) {
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

        revalidatePath(`/business/my-businesses/${updatedService.businessId}`);

        return updatedService;
    } catch (error) {
        console.log("Error in updateService:", error);
        return { error: true, message: "Something went wrong updating service" };
    }
}

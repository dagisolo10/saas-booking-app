"use server";

import prisma from "@/lib/config/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function deleteBusiness({ businessId }: { businessId: string }) {
    try {
        const supabase = createClient();
                const {
                    data: { session },
                } = await (await supabase).auth.getSession();
        
                const user = session?.user;

        if (!user) return { error: true, message: "Unauthorized" };

        const business = await prisma.business.findUnique({
            where: {
                id: businessId,
                ownerId: user.id,
            },
        });
        if (!business) return { error: true, message: "Business not found or not owned by you" };

        // then delete the all
        await prisma.$transaction(async (trx) => {
            await trx.booking.deleteMany({
                where: {
                    service: {
                        businessId,
                    },
                },
            });
            await trx.service.deleteMany({
                where: {
                    businessId,
                },
            });
            await trx.business.delete({
                where: {
                    id: businessId,
                },
            });
        });

        return { success: true };
    } catch (error) {
        console.log("Error in deleteBusiness:", error);
        return { error: true, message: "Something went wrong deleting business" };
    }
}

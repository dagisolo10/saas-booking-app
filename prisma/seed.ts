// import prisma from "@/lib/config/prisma";
// import { BookingStatus, Role } from "@prisma/client";

import prisma from "@/lib/config/prisma";

// // --- Helpers ---
// const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
// const cities = ["Addis Ababa", "Adama", "Bahir Dar", "Hawassa", "Mekelle", "Dire Dawa"];
// const serviceCategories = ["Barber", "Spa", "Auto", "Fitness", "Education", "Cleaning"];

// const generateHours = () => {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const hours: any = {};
//     weekdays.forEach((day) => (hours[day] = { open: "08:00", close: "18:00" }));
//     hours["saturday"] = { open: "09:00", close: "13:00" };
//     hours["sunday"] = null; // Closed
//     return hours;
// };

// const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// async function main() {
//     console.log("🧹 Wiping database...");
//     await prisma.$transaction([prisma.review.deleteMany(), prisma.booking.deleteMany(), prisma.service.deleteMany(), prisma.business.deleteMany(), prisma.user.deleteMany()]);

//     console.log("👥 Creating 20 Users...");
//     const owners = await Promise.all(
//         Array.from({ length: 10 }).map((_, i) =>
//             prisma.user.create({
//                 data: { id: `owner-${i}`, email: `owner${i}@test.com`, name: `Owner ${i}`, role: Role.BUSINESS },
//             }),
//         ),
//     );

//     const customers = await Promise.all(
//         Array.from({ length: 10 }).map((_, i) =>
//             prisma.user.create({
//                 data: { id: `customer-${i}`, email: `customer${i}@test.com`, name: `Customer ${i}`, role: Role.CUSTOMER },
//             }),
//         ),
//     );

//     console.log("🏢 Creating 25 Businesses & 625 Services...");
//     for (let b = 0; b < 25; b++) {
//         const owner = randomFrom(owners);
//         const business = await prisma.business.create({
//             data: {
//                 id: `biz-${b}`,
//                 name: `Elite ${randomFrom(serviceCategories)} ${b}`,
//                 description: "Premium service provider with top-tier professionals.",
//                 location: randomFrom(cities),
//                 phone: `+251911${Math.floor(100000 + Math.random() * 900000)}`,
//                 hours: generateHours(),
//                 bannerImages: [`https://picsum.photos/seed/biz${b}a/800/400`, `https://picsum.photos/seed/biz${b}b/800/400`, `https://picsum.photos/seed/biz${b}c/800/400`],
//                 ownerId: owner.id,
//             },
//         });

//         // Create 25 services for this business
//         for (let s = 0; s < 25; s++) {
//             const serviceId = `srv-${b}-${s}`;
//             const service = await prisma.service.create({
//                 data: {
//                     id: serviceId,
//                     name: `Service ${s} at Biz ${b}`,
//                     duration: randomFrom([30, 45, 60, 90]),
//                     price: Math.floor(Math.random() * 500) + 100,
//                     businessId: business.id,
//                     category: randomFrom(serviceCategories),
//                     thumbnail: `https://picsum.photos/seed/${serviceId}/200/200`,
//                 },
//             });

//             // Create Bookings to populate active/completed stats
//             const statuses: BookingStatus[] = ["COMPLETED", "CONFIRMED", "PENDING", "CANCELLED"];
//             // ... inside the service loop ...
//             let completedCount = 0;
//             let activeCount = 0;
//             // Track which users already reviewed this specific service
//             const usersWhoReviewed = new Set<string>();

//             for (let k = 0; k < 10; k++) {
//                 const status = randomFrom(statuses);
//                 const customer = randomFrom(customers);

//                 const bookingDate = new Date();
//                 bookingDate.setDate(bookingDate.getDate() + k + s * 25 + b * 625);

//                 await prisma.booking.create({
//                     data: {
//                         date: bookingDate,
//                         status: status,
//                         userId: customer.id,
//                         serviceId: service.id,
//                     },
//                 });

//                 if (status === "COMPLETED") completedCount++;
//                 if (status === "CONFIRMED") activeCount++;

//                 // Only create a review if:
//                 // 1. Status is COMPLETED
//                 // 2. We haven't reached 3 reviews for this service yet
//                 // 3. THIS user hasn't reviewed THIS service yet
//                 if (status === "COMPLETED" && usersWhoReviewed.size < 3 && !usersWhoReviewed.has(customer.id)) {
//                     await prisma.review.create({
//                         data: {
//                             rating: Math.floor(Math.random() * 3) + 3,
//                             comment: randomFrom(["Amazing service!", "Very professional.", "Highly recommend this place.", "Great results!"]),
//                             userId: customer.id,
//                             serviceId: service.id,
//                         },
//                     });
//                     usersWhoReviewed.add(customer.id); // Mark this user as "done" for this service
//                 }
//             }

//             // Update Service with calculated stats
//             const reviews = await prisma.review.findMany({ where: { serviceId: service.id } });
//             const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

//             await prisma.service.update({
//                 where: { id: service.id },
//                 data: {
//                     totalCompleted: completedCount,
//                     activeBookings: activeCount,
//                     totalReviews: reviews.length,
//                     rating: avgRating || 0,
//                 },
//             });
//         }

//         // Sync Business total stats
//         const bizServices = await prisma.service.findMany({ where: { businessId: business.id } });
//         const totalReviews = bizServices.reduce((acc, s) => acc + s.totalReviews, 0);
//         const bizAvgRating = bizServices.reduce((acc, s) => acc + (s.rating || 0), 0) / bizServices.length;

//         await prisma.business.update({
//             where: { id: business.id },
//             data: {
//                 reviewCount: totalReviews,
//                 rating: bizAvgRating,
//             },
//         });
//     }

//     console.log("🎉 Seeding Finished Successfully!");
// }

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });

async function main() {
    const bizId1 = "c7ea4350-1762-447e-928b-4c68ba6cd5e2";
    const bizId2 = "40b2e3d8-d53b-4d7d-b0eb-ecc2df89d0c1";

    console.log("🌱 Seeding 10 services for each business...");

    const services = [
        // --- 10 Services for Elite Grooming (bizId1) ---
        { name: "Executive Haircut", duration: 45, price: 35.0, businessId: bizId1, category: "Grooming", thumbnail: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70" },
        { name: "Beard Sculpting", duration: 30, price: 20.0, businessId: bizId1, category: "Grooming", thumbnail: "https://images.unsplash.com/photo-1621605815841-aa33c56318d1" },
        { name: "Luxury Hot Shave", duration: 45, price: 45.0, businessId: bizId1, category: "Grooming", thumbnail: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1" },
        { name: "Scalp Treatment", duration: 20, price: 30.0, businessId: bizId1, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1" },
        { name: "Full Color & Highlight", duration: 120, price: 85.0, businessId: bizId1, category: "Grooming", thumbnail: "https://images.unsplash.com/photo-1560869713-7d0a29430803" },
        { name: "Junior Haircut", duration: 30, price: 20.0, businessId: bizId1, category: "Grooming", thumbnail: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1" },
        { name: "Neck Clean Up", duration: 15, price: 10.0, businessId: bizId1, category: "Grooming", thumbnail: "https://images.unsplash.com/photo-1593702295674-26c7f381d4b4" },
        { name: "Facial Grooming Mask", duration: 25, price: 25.0, businessId: bizId1, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069" },
        { name: "The Works (Cut + Shave)", duration: 90, price: 75.0, businessId: bizId1, category: "Grooming", thumbnail: "https://images.unsplash.com/photo-1622286332618-f28020ee51c8" },
        { name: "Nose & Ear Waxing", duration: 15, price: 15.0, businessId: bizId1, category: "Grooming", thumbnail: "https://images.unsplash.com/photo-1515377905703-c4788e51af15" },

        // --- 10 Services for Serenity Spa (bizId2) ---
        { name: "Deep Tissue Release", duration: 60, price: 95.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874" },
        { name: "Signature Swedish", duration: 60, price: 85.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2" },
        { name: "Hot Stone Therapy", duration: 75, price: 110.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1519415510271-433ad6102628" },
        { name: "Hydrating Facial", duration: 45, price: 65.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881" },
        { name: "Prenatal Massage", duration: 60, price: 90.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1" },
        { name: "Organic Body Wrap", duration: 90, price: 120.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874" },
        { name: "Couple's Retreat", duration: 60, price: 180.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2" },
        { name: "Detox Mud Bath", duration: 45, price: 75.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1515377905703-c4788e51af15" },
        { name: "Zen Head Spa", duration: 30, price: 50.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1" },
        { name: "Ultimate Foot Spa", duration: 40, price: 55.0, businessId: bizId2, category: "Wellness", thumbnail: "https://images.unsplash.com/photo-1519415510271-433ad6102628" },
    ];

    await prisma.service.createMany({
        data: services,
        skipDuplicates: true,
    });

    console.log("✅ Successfully seeded 20 services.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

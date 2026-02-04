// /* eslint-disable @typescript-eslint/no-explicit-any */
// import prisma from "@/lib/config/prisma";
// import { BookingStatus, Role } from "@prisma/client";
// const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
// function generateBusinessHours() {
//     const hours: Record<string, { open: string; close: string } | null> = {};
//     weekdays.forEach((day, i) => {
//         if (i === 6)
//             hours[day] = null; // Sunday closed
//         else hours[day] = { open: "08:00", close: i === 5 ? "16:00" : "18:00" };
//     });
//     return hours;
// }
// function randomFrom<T>(arr: T[]): T {
//     return arr[Math.floor(Math.random() * arr.length)];
// }
// function randomDateInFebruary() {
//     const start = new Date("2026-02-01T08:00:00Z").getTime();
//     const end = new Date("2026-02-28T18:00:00Z").getTime();
//     return new Date(start + Math.random() * (end - start));
// }
// function randomRating() {
//     return Math.floor(Math.random() * 5) + 1; // 1–5 stars
// }
// function randomComment() {
//     const pool = ["Excellent service!", "Professional.", "Good experience.", "Highly recommend!"];
//     return randomFrom(pool);
// }
// const businessDescriptions = ["A modern salon offering premium grooming.", "Your trusted wellness studio.", "A top-rated fitness center.", "Professional photography services.", "Quality pet grooming and care."];
// const businessCities = ["Addis Ababa", "Adama", "Bahir Dar", "Hawassa", "Mekelle"];
// const serviceNames = ["Haircut", "Facial", "Car Wash", "Massage", "Yoga Session", "Guitar Lesson", "Plumbing Repair", "Pet Grooming", "Tutoring", "Photography", "Software Support"];
// const serviceCategories = ["Beauty & Grooming", "Health & Wellness", "Home Services", "Education & Tutoring", "Automotive & Repair"];
// async function main() {
//     console.log("🧹 Cleaning up database...");
//     await prisma.$transaction([prisma.review.deleteMany(), prisma.booking.deleteMany(), prisma.service.deleteMany(), prisma.business.deleteMany(), prisma.user.deleteMany()]);
//     console.log("🌱 Database cleaned. Starting seed...");
//     // ---- USERS ----
//     const usersData = [
//         ...Array.from({ length: 5 }, (_, i) => ({
//             id: `owner-${i + 1}`,
//             name: `Owner ${i + 1}`,
//             email: `owner${i + 1}@example.com`,
//             role: Role.BUSINESS,
//         })),
//         ...Array.from({ length: 5 }, (_, i) => ({
//             id: `customer-${i + 1}`,
//             name: `Customer ${i + 1}`,
//             email: `customer${i + 1}@example.com`,
//             role: Role.CUSTOMER,
//         })),
//     ];
//     await prisma.user.createMany({ data: usersData });
//     console.log("✅ Created users");
//     // ---- BUSINESSES ----
//     const businessesData = Array.from({ length: 25 }, (_, i) => ({
//         id: `biz-${i + 1}`,
//         name: `Business ${i + 1}`,
//         description: randomFrom(businessDescriptions),
//         location: randomFrom(businessCities),
//         phone: `+2519${Math.floor(10000000 + Math.random() * 89999999)}`,
//         bannerImages: [`https://picsum.photos/seed/business-${i + 1}/800/400`],
//         hours: generateBusinessHours(),
//         ownerId: `owner-${(i % 5) + 1}`,
//     }));
//     await prisma.business.createMany({ data: businessesData });
//     console.log("✅ Created businesses");
//     // ---- SERVICES ----
//     const allServices: any[] = [];
//     for (let b = 1; b <= 25; b++) {
//         const selected = [...serviceNames].sort(() => 0.5 - Math.random()).slice(0, 3);
//         selected.forEach((name, i) => {
//             const totalCompleted = Math.floor(Math.random() * 150) + 10;
//             const category = randomFrom(serviceCategories);
//             allServices.push({
//                 id: `srv-${b}-${i + 1}`,
//                 name: `${name} (Biz ${b})`,
//                 duration: Math.floor(Math.random() * 60) + 30,
//                 price: Math.floor(Math.random() * 100) + 20,
//                 businessId: `biz-${b}`,
//                 totalCompleted,
//                 activeBookings: Math.floor(Math.random() * 10),
//                 category, // ✅ added category
//                 thumbnail: `https://picsum.photos/seed/service-${b}-${i + 1}/400/300`, // ✅ added thumbnail
//             });
//         });
//     }
//     await prisma.service.createMany({ data: allServices });
//     console.log(`✅ Created ${allServices.length} services with categories & thumbnails`);
//     // ---- BOOKINGS ----
//     const bookingsData: any[] = [];
//     const reviewsData: any[] = [];
//     for (let c = 1; c <= 5; c++) {
//         for (let i = 1; i <= 8; i++) {
//             const randomService = randomFrom(allServices);
//             const date = randomDateInFebruary();
//             const status = randomFrom(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]) as BookingStatus;
//             const bookingId = `bk-${c}-${i}-${btoa(randomService.id).substring(0, 5)}`;
//             bookingsData.push({
//                 id: bookingId,
//                 date,
//                 status,
//                 userId: `customer-${c}`,
//                 serviceId: randomService.id,
//                 createdAt: new Date(date.getTime() - 1000 * 60 * 60 * 24 * 2),
//             });
//             if (status === "COMPLETED") {
//                 reviewsData.push({
//                     id: `rev-${c}-${i}-${btoa(randomService.id).substring(0, 5)}`,
//                     rating: randomRating(),
//                     comment: randomComment(),
//                     userId: `customer-${c}`,
//                     serviceId: randomService.id,
//                     createdAt: new Date(),
//                 });
//             }
//         }
//     }
//     await prisma.booking.createMany({ data: bookingsData });
//     if (reviewsData.length > 0) await prisma.review.createMany({ data: reviewsData });
//     console.log("🎉 Seeding complete!");
// }
// main()
//     .catch((e) => {
//         console.error("❌ Seed failed:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
import prisma from "@/lib/config/prisma";
import { BookingStatus, Role } from "@prisma/client";

// --- Helpers ---
const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const cities = ["Addis Ababa", "Adama", "Bahir Dar", "Hawassa", "Mekelle", "Dire Dawa"];
const serviceCategories = ["Barber", "Spa", "Auto", "Fitness", "Education", "Cleaning"];

const generateHours = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hours: any = {};
    weekdays.forEach((day) => (hours[day] = { open: "08:00", close: "18:00" }));
    hours["saturday"] = { open: "09:00", close: "13:00" };
    hours["sunday"] = null; // Closed
    return hours;
};

const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
    console.log("🧹 Wiping database...");
    await prisma.$transaction([prisma.review.deleteMany(), prisma.booking.deleteMany(), prisma.service.deleteMany(), prisma.business.deleteMany(), prisma.user.deleteMany()]);

    console.log("👥 Creating 20 Users...");
    const owners = await Promise.all(
        Array.from({ length: 10 }).map((_, i) =>
            prisma.user.create({
                data: { id: `owner-${i}`, email: `owner${i}@test.com`, name: `Owner ${i}`, role: Role.BUSINESS },
            }),
        ),
    );

    const customers = await Promise.all(
        Array.from({ length: 10 }).map((_, i) =>
            prisma.user.create({
                data: { id: `customer-${i}`, email: `customer${i}@test.com`, name: `Customer ${i}`, role: Role.CUSTOMER },
            }),
        ),
    );

    console.log("🏢 Creating 25 Businesses & 625 Services...");
    for (let b = 0; b < 25; b++) {
        const owner = randomFrom(owners);
        const business = await prisma.business.create({
            data: {
                id: `biz-${b}`,
                name: `Elite ${randomFrom(serviceCategories)} ${b}`,
                description: "Premium service provider with top-tier professionals.",
                location: randomFrom(cities),
                phone: `+251911${Math.floor(100000 + Math.random() * 900000)}`,
                hours: generateHours(),
                bannerImages: [`https://picsum.photos/seed/biz${b}a/800/400`, `https://picsum.photos/seed/biz${b}b/800/400`, `https://picsum.photos/seed/biz${b}c/800/400`],
                ownerId: owner.id,
            },
        });

        // Create 25 services for this business
        for (let s = 0; s < 25; s++) {
            const serviceId = `srv-${b}-${s}`;
            const service = await prisma.service.create({
                data: {
                    id: serviceId,
                    name: `Service ${s} at Biz ${b}`,
                    duration: randomFrom([30, 45, 60, 90]),
                    price: Math.floor(Math.random() * 500) + 100,
                    businessId: business.id,
                    category: randomFrom(serviceCategories),
                    thumbnail: `https://picsum.photos/seed/${serviceId}/200/200`,
                },
            });

            // Create Bookings to populate active/completed stats
            const statuses: BookingStatus[] = ["COMPLETED", "CONFIRMED", "PENDING", "CANCELLED"];
            // ... inside the service loop ...
            let completedCount = 0;
            let activeCount = 0;
            // Track which users already reviewed this specific service
            const usersWhoReviewed = new Set<string>();

            for (let k = 0; k < 10; k++) {
                const status = randomFrom(statuses);
                const customer = randomFrom(customers);

                const bookingDate = new Date();
                bookingDate.setDate(bookingDate.getDate() + k + s * 25 + b * 625);

                await prisma.booking.create({
                    data: {
                        date: bookingDate,
                        status: status,
                        userId: customer.id,
                        serviceId: service.id,
                    },
                });

                if (status === "COMPLETED") completedCount++;
                if (status === "CONFIRMED") activeCount++;

                // Only create a review if:
                // 1. Status is COMPLETED
                // 2. We haven't reached 3 reviews for this service yet
                // 3. THIS user hasn't reviewed THIS service yet
                if (status === "COMPLETED" && usersWhoReviewed.size < 3 && !usersWhoReviewed.has(customer.id)) {
                    await prisma.review.create({
                        data: {
                            rating: Math.floor(Math.random() * 3) + 3,
                            comment: randomFrom(["Amazing service!", "Very professional.", "Highly recommend this place.", "Great results!"]),
                            userId: customer.id,
                            serviceId: service.id,
                        },
                    });
                    usersWhoReviewed.add(customer.id); // Mark this user as "done" for this service
                }
            }

            // Update Service with calculated stats
            const reviews = await prisma.review.findMany({ where: { serviceId: service.id } });
            const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

            await prisma.service.update({
                where: { id: service.id },
                data: {
                    totalCompleted: completedCount,
                    activeBookings: activeCount,
                    totalReviews: reviews.length,
                    rating: avgRating || 0,
                },
            });
        }

        // Sync Business total stats
        const bizServices = await prisma.service.findMany({ where: { businessId: business.id } });
        const totalReviews = bizServices.reduce((acc, s) => acc + s.totalReviews, 0);
        const bizAvgRating = bizServices.reduce((acc, s) => acc + (s.rating || 0), 0) / bizServices.length;

        await prisma.business.update({
            where: { id: business.id },
            data: {
                reviewCount: totalReviews,
                rating: bizAvgRating,
            },
        });
    }

    console.log("🎉 Seeding Finished Successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

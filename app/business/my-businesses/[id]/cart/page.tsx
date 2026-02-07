// import { getMyBusinessById } from "@/app/business/_actions/get-my-business";
// import ServiceCategoryList from "@/app/business/_components/my-service-list";
// import RatingStars from "@/components/rating-stars";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Service } from "@/lib/types";
// import Image from "next/image";
// import { notFound } from "next/navigation";

// export default async function BusinessServiceCart({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = await params;

//     if (!id) return notFound();

//     const business = await getMyBusinessById(id);

//     if (!business) return notFound();

//     const services = business.services as Service[];

//     return (
//         <main className="mx-auto min-h-screen px-8">
//             <div className="relative container py-4">
//                 <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
//                     {/* LEFT SIDE: Client Component handles scrollspy/carousel */}
//                     <ServiceCategoryList services={services} />

//                     {/* RIGHT: Sidebar Info */}
//                     <div className="sticky top-8">
//                         <Card className="border-none">
//                             <CardHeader className="grid grid-cols-3">
//                                 <Image src={business.bannerImages[0]} alt={business.name} width={1080} height={300} className="col-span-1 h-full rounded-md object-cover object-top brightness-50" priority />
//                                 <div className="col-span-2 text-left">
//                                     <CardTitle className="text-xl font-bold">{business.name}</CardTitle>
//                                     <div className="flex items-center gap-2">
//                                         <span className="font-semibold">{business.rating?.toFixed(1)}</span>
//                                         <RatingStars rating={business.rating ?? 0} />
//                                         <span className="font-medium">({business.reviewCount} Reviews)</span>
//                                     </div>
//                                     <CardContent className="px-0">{business.location}</CardContent>
//                                 </div>
//                             </CardHeader>
//                             <CardContent>
//                                 <CardDescription className="mb-4">No services selected</CardDescription>
//                                 <div className="flex items-center justify-between border-t py-4">
//                                     <CardTitle>Total</CardTitle>
//                                     <CardTitle>Free</CardTitle>
//                                 </div>
//                                 <CardContent className="min-h-48 space-y-4 overflow-y-auto p-0">{/* Selected services */}</CardContent>
//                             </CardContent>
//                             <CardFooter className="mt-auto">
//                                 <Button className="w-full rounded-full bg-black py-3">Continue</Button>
//                             </CardFooter>
//                         </Card>
//                     </div>
//                 </div>
//             </div>
//         </main>
//     );
// }

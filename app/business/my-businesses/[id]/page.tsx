import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock } from "lucide-react";
import { InputJsonObject } from "@prisma/client/runtime/client";
import { getMyBusinessById } from "../../_actions/get-my-business";
import RatingStars from "@/components/rating-stars";
import MyServiceList from "../../_components/my-service-list";

interface Service {
    id: string;
    name: string;
    duration: number;
    category: string;
    price: number;
    rating: number;
}

type BusinessHourProp = {
    hours: Record<string, InputJsonObject>;
};

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) return notFound();

    const business = await getMyBusinessById(id);

    if (!business) return notFound();

    const services = business.services as Service[];

    return (
        <main className="mx-auto min-h-screen px-8 pt-8">
            {/* HERO SECTION */}
            <div className="relative h-[40vh] w-full">
                <Image src={business.bannerImages[0] || "/placeholder-biz.jpg"} alt={business.name} fill className="object-cover object-top brightness-50" priority />
                <div className="absolute inset-0 flex items-center justify-center p-8 text-white md:p-16">
                    <div className="container">
                        <h1 className="text-4xl font-bold md:text-6xl">{business.name}</h1>
                        <div className="mt-4 flex flex-wrap items-center gap-8 text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{business.rating?.toFixed(1)}</span>
                                <RatingStars rating={business.rating ?? 0} />
                                <span className="font-medium">({business.reviewCount} Reviews)</span>
                            </div>
                            <span className="flex items-center gap-2">
                                <MapPin size={18} /> {business.location}
                            </span>
                            <span className="flex items-center gap-2">
                                <Phone size={18} /> {business.phone}
                            </span>
                        </div>
                        <h2 className="text-muted mt-4 text-xl font-medium">{business.description}</h2>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid h-[40vh] grid-cols-1 gap-4 md:grid-cols-2">
                {business.bannerImages[1] && (
                    <div className="relative overflow-hidden">
                        <Image src={business.bannerImages[1]} fill alt={business.name} className="rounded-md object-cover object-center brightness-50 transition-all duration-300 hover:scale-100 md:scale-105" priority />
                    </div>
                )}
                {business.bannerImages[2] && (
                    <div className="relative overflow-hidden">
                        <Image src={business.bannerImages[2]} fill alt={business.name} className="rounded-md object-cover object-center brightness-50 transition-all duration-300 hover:scale-100 md:scale-105" priority />
                    </div>
                )}
            </div>

            <div className="relative container py-12">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
                    {/* LEFT: Services Grid */}
                    <MyServiceList services={services} />

                    {/* RIGHT: Sidebar Info */}
                    <div className="sticky top-4 space-y-6">
                        <BusinessHours hours={business.hours as BusinessHourProp} />
                        <Description description={business.description ?? "No Description"} />
                    </div>
                </div>
            </div>
        </main>
    );
}

function BusinessHours({ hours }: { hours: BusinessHourProp }) {
    const businessHours = Object.entries(hours);

    return (
        <Card className="border-none">
            <CardContent className="space-y-4 p-6">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                    <Clock size={20} /> Business Hours
                </h3>
                <div className="space-y-2 text-sm">
                    {businessHours.map(([day, time]) => (
                        <div key={day} className="flex justify-between border-b pb-1 capitalize">
                            <span className="text-muted-foreground">{day}</span>
                            <span className="font-medium">{time ? `${time.open} - ${time.close}` : <Badge variant="secondary">Closed</Badge>}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function Description({ description }: { description: string }) {
    return (
        <Card className="bg-muted/50 border-none shadow-md">
            <CardContent className="p-6">
                <h3 className="mb-2 font-bold">About Us</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    );
}

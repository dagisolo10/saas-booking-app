import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Info, Globe, Settings } from "lucide-react";
import { getMyBusinessById } from "../../_actions/get-my-business";
import RatingStars from "@/components/rating-stars";
import MyServiceList from "../../_components/my-services-list";
import Link from "next/link";
import getTimezoneOffset from "@/lib/helpers/timezone-converter";
import { Button } from "@/components/ui/button";

interface Service {
    id: string;
    name: string;
    duration: number;
    category: string;
    price: number;
    rating: number;
    businessId: string;
    thumbnail: string;
}

type TimeRange = { open: string; close: string };
type WeeklySchedule = Record<string, TimeRange | null>;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const business = await getMyBusinessById(id);

    if (!business || "error" in business) return notFound();

    return { title: `${business?.name || "Business"} | Bookly`, description: business?.description || "Check out this business on our platform." };
}

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) return notFound();

    const business = await getMyBusinessById(id);

    if (!business || "error" in business) return notFound();

    const services = business.services as Service[];

    const hasSecondaryImages = business.bannerImages.length > 1;

    return (
        <main className="min-h-screen p-6">
            {/* HERO SECTION */}
            <div className="relative min-h-[40vh] w-full overflow-hidden rounded-3xl bg-zinc-900">
                <Image src={business.bannerImages[0] || "/unsplash.jpg"} alt={business.name} fill className="object-cover object-center brightness-50" priority />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center p-6 text-zinc-50 md:p-16">
                    <div className="container mx-auto">
                        <Badge className="mb-2 border-none bg-white/20 backdrop-blur-md hover:bg-white/30">Official Storefront</Badge>
                        <h1 className="text-3xl font-bold sm:text-4xl md:text-6xl">{business.name}</h1>

                        <div className="mt-4 flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center sm:gap-6">
                            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md sm:px-4">
                                <span className="text-base font-bold text-yellow-400 sm:text-lg">{business.rating?.toFixed(1)}</span>
                                <RatingStars rating={business.rating ?? 0} />
                                <span className="hidden text-sm opacity-70 sm:inline">({business.reviewCount} Reviews)</span>
                            </div>
                            <span className="flex items-center gap-2 text-sm font-medium sm:text-base">
                                <MapPin size={18} /> {business.location}
                            </span>
                            <Link className="flex items-center gap-2 text-sm font-medium sm:text-base" href={`tel:${business.phone}`}>
                                <Phone size={18} /> {business.phone}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="absolute top-6 right-6">
                    <Link href={`/business/my-businesses/${id}/settings`}>
                        <Button variant={`secondary`} className="cursor-pointer rounded-full border-none bg-white/20 text-white backdrop-blur-md hover:bg-white/40">
                            <Settings className="size-4" />
                            Business Settings
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="container px-0 sm:px-4">
                {hasSecondaryImages && (
                    <div className={`mt-6 grid h-auto min-h-[20vh] gap-4 sm:h-[30vh] ${business.bannerImages.length === 2 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                        {business.bannerImages.slice(1, 3).map((img, idx) => (
                            <div key={idx} className="group relative min-h-50 overflow-hidden rounded-2xl sm:min-h-full">
                                <Image src={img} fill alt="Business interior" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="py-8 md:py-12">
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-12">
                        {/* LEFT: Services Grid */}
                        <MyServiceList services={services} businessId={business.id ?? ""} />

                        {/* RIGHT: Sidebar Info */}
                        <aside className="top-20 order-1 sm:sticky lg:order-2">
                            <div className="space-y-6">
                                <BusinessHours timezone={business.timeZone ?? ""} hours={business.hours as WeeklySchedule} />
                                <Description description={business.description ?? "No Description"} />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}

function BusinessHours({ hours, timezone }: { hours: WeeklySchedule; timezone: string }) {
    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const sortedHours = Object.entries(hours || {}).sort(([a], [b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    const now = new Date();
    const currentDay = dayOrder[now.getDay()];
    const offset = getTimezoneOffset(timezone);

    const currentTime = now.toLocaleTimeString(undefined, { timeZone: timezone, hour12: false, hour: "2-digit", minute: "2-digit" });
    const todayHours = hours[currentDay];
    const isOpen = todayHours && currentTime >= todayHours.open && currentTime <= todayHours.close;

    return (
        <Card className="border-none shadow-sm">
            <CardContent className="space-y-4 p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-xl font-bold">
                        <Clock size={20} /> Business Hours
                    </h3>
                    {isOpen ? (
                        <div className="flex animate-pulse items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                            <span className="size-1.5 rounded-full bg-emerald-600" />
                            OPEN NOW
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-400">
                            <span className="size-1.5 rounded-full bg-red-600" />
                            CLOSED
                        </div>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    {sortedHours.map(([day, time]) => {
                        const isToday = day === currentDay;

                        return (
                            <div key={day} className={`flex justify-between border-b pb-1.5 capitalize last:border-b-0 ${isToday ? "font-bold text-zinc-950" : "font-medium text-zinc-600"}`}>
                                <span>
                                    {day} {isToday && " (Today)"}
                                </span>
                                <span className="text-right">
                                    {time ? (
                                        `${time.open} - ${time.close}`
                                    ) : (
                                        <Badge variant="secondary" className="font-normal">
                                            Closed
                                        </Badge>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    <div className="flex items-center gap-1">
                        <Globe size={12} />
                        <span className="max-w-37.5 truncate">{timezone.replace(/_/g, " ")}</span>
                    </div>
                    <span>{offset}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function Description({ description }: { description: string }) {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-6">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-zinc-400">
                    <Info size={18} /> Our Story
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description || "This business hasn't shared their story yet, but they're ready to serve you!"}</p>
            </CardContent>
        </Card>
    );
}

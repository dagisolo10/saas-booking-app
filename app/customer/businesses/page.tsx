import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { MapPin, Store } from "lucide-react";
import Link from "next/link";
import { getAllBusinesses } from "../_actions/get-business";
import RatingStars from "@/components/rating-stars";

export default async function Businesses() {
    const businesses = await getAllBusinesses();

    if ("error" in businesses)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-destructive">Error: {businesses.message}</p>
            </div>
        );

    return (
        <main className="mx-auto min-h-screen px-8 pt-12">
            {businesses.length === 0 ? (
                <div className="flex h-100 flex-col items-center justify-center rounded-3xl border-2 border-dashed">
                    <Store className="text-muted-foreground mb-4 size-12" />
                    <h2 className="text-xl font-semibold">No businesses found</h2>
                    <p className="text-muted-foreground">There are no businesses posted at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((bus) => (
                        <BusinessCard key={bus.id} id={bus.id} banner={bus.bannerImages[0]} name={bus.name} location={bus.location ?? ""} rating={bus.rating ?? 0} />
                    ))}
                </div>
            )}
        </main>
    );
}

interface BusinessProp {
    banner: string;
    name: string;
    location: string;
    rating: number;
    id: string;
}

function BusinessCard({ banner, name, location, rating, id }: BusinessProp) {
    return (
        <Link href={`/customer/businesses/${id}`}>
            <Card className="gap-2 rounded-none pt-0 shadow-none transition-shadow duration-300 hover:shadow-sm">
                <CardHeader className="p-0">
                    <div className="overflow-hidden">
                        <Image className="transition-all duration-300 hover:scale-105" src={banner} alt={name} width={1080} height={300} />
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle>{name}</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{rating.toFixed(1)}</span>
                        <RatingStars rating={rating} />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <MapPin className="size-3.5" />
                        <CardDescription>{location}</CardDescription>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyBusinesses } from "../_actions/get-my-business";
import Image from "next/image";
import { MapPin, Plus, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/rating-stars";
import BusinessSearchGrid from "../_components/business-search";

export default async function MyBusinesses() {
    const businesses = await getMyBusinesses();

    if ("error" in businesses)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-destructive">Error: {businesses.message}</p>
            </div>
        );

    return (
        <main className="mx-auto min-h-screen p-8 px-4 sm:px-12">
            {/* Header Section */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">My Businesses</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Manage your storefronts, view ratings, and update service listings.</p>
                </div>
                <Button asChild className="rounded-full py-2 shadow-lg">
                    <Link href="/business/new">
                        <Plus className="mr-1 size-4" />
                        Add New Business
                    </Link>
                </Button>
            </div>
            {businesses.length === 0 ? (
                <div className="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed">
                    <Store className="text-muted-foreground mb-4 size-12" />
                    <h2 className="text-xl font-semibold">No businesses found</h2>
                    <p className="text-muted-foreground">Get started by registering your first business.</p>
                </div>
            ) : (
                <div className="mt-6">
                    <BusinessSearchGrid allBusinesses={businesses} />
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

export function BusinessCard({ banner, name, location, rating, id }: BusinessProp) {
    return (
        <Link href={`/business/my-businesses/${id}`}>
            <Card className="gap-2 rounded-none rounded-b-md pt-0 shadow-none transition-shadow duration-300 hover:shadow-sm">
                <CardHeader className="p-0">
                    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden">
                        {banner ? (
                            <Image className="object-cover transition-all duration-300 hover:scale-105" src={banner} alt={name} fill />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Store className="size-12 text-zinc-300" />
                                <p className="text-sm font-bold tracking-widest text-zinc-400 uppercase">No Storefront Image</p>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle>{name}</CardTitle>
                    <div className="flex items-center gap-2">
                        <CardDescription className="">{rating.toFixed(1)}</CardDescription>
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

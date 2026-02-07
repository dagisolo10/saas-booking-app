import { Store, MapPin } from "lucide-react";
import RatingStars from "./rating-stars";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./ui/card";
import Image from "next/image";
import Link from "next/link";

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

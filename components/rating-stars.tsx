import { Star } from "lucide-react";

export default function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center">
            {Array.from({ length: Math.floor(parseFloat((rating || 0).toFixed(1))) }).map((_, i) => (
                <Star key={`full-${i}`} className="size-4 fill-yellow-400 text-yellow-400" />
            ))}
            {(parseFloat((rating || 0).toFixed(1)) || 0) % 1 !== 0 && (
                <div className="relative inline-flex">
                    <Star className="size-4 fill-transparent text-yellow-400" />
                    <div className="absolute inset-0 w-1/2 overflow-hidden">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    </div>
                </div>
            )}
            {Array.from({ length: 5 - Math.ceil(rating || 0) }).map((_, i) => (
                <Star key={`empty-${i}`} className="size-4 fill-transparent text-yellow-400" />
            ))}
        </div>
    );
}

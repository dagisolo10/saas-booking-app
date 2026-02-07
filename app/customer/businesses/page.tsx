import { getAllBusinesses } from "../_actions/get-business";
import { Store, Sparkles } from "lucide-react";
import CustomerBusinessSearchGrid from "../_components/customer-business-search-grid";

export default async function CustomerBusinessesPage() {
    const businesses = await getAllBusinesses();

    if ("error" in businesses) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <div className="bg-destructive/10 rounded-full p-4">
                    <Store className="text-destructive size-10" />
                </div>
                <p className="text-destructive mt-4 font-medium">Error: {businesses.message}</p>
            </div>
        );
    }

    return (
        <main className="mx-auto min-h-screen p-8 px-4 sm:px-12">
            {/* Header Section: Discovery focused */}
            <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                    <div className="text-primary mb-2 flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                        <Sparkles size={16} className="fill-primary" />
                        <span>Discover Local Favorites</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight md:text-5xl">Explore Businesses</h1>
                    <p className="text-muted-foreground mt-3 text-lg leading-relaxed">Find the best-rated services in your area. From top-tier salons to professional consultants, discover your next destination.</p>
                </div>
            </div>

            {/* Content Logic */}
            {businesses.length === 0 ? (
                <div className="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                    <Store className="mb-4 size-12 text-zinc-300" />
                    <h2 className="text-xl font-semibold text-zinc-600">No businesses listed yet</h2>
                    <p className="text-muted-foreground">Check back later for new arrivals in your area.</p>
                </div>
            ) : (
                <CustomerBusinessSearchGrid allBusinesses={businesses} />
            )}

            {/* Visual Footer/Separator */}
            {businesses.length > 0 && (
                <div className="mt-8 flex flex-col items-center border-t border-zinc-100 pt-6 text-center">
                    <div className="rounded-full bg-zinc-50 px-4 py-1 text-xs font-medium text-zinc-400">End of listings</div>
                </div>
            )}
        </main>
    );
}

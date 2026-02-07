import CustomerServiceSearchGrid from "../_components/customer-service-search-grid";
import { Sparkles, Scissors, AlertCircle } from "lucide-react";
import { getAllServices } from "../_actions/get-services";
import { Service } from "@/lib/types";

export default async function CustomerServices() {
    const services = await getAllServices();

    if ("error" in services) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-2">
                <AlertCircle className="text-destructive size-10" />
                <p className="text-destructive font-medium">Error: {services.message}</p>
            </div>
        );
    }

    return (
        <main className="mx-auto min-h-screen p-8 px-4 sm:px-12">
            {/* Header Section */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                    <div className="text-primary mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                        <Sparkles size={16} className="fill-yellow-500 text-yellow-500" />
                        <span>Premium Experiences</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight md:text-5xl">Professional Services</h1>
                    <p className="text-muted-foreground mt-3 text-lg leading-relaxed">Find and book the perfect service. From hair and beauty to specialized consultations, our experts are ready to serve you.</p>
                </div>
            </div>

            {/* Empty State vs Search Grid Logic */}
            {services.length === 0 ? (
                <div className="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-zinc-50/50 transition-colors hover:bg-zinc-50">
                    <Scissors className="text-muted-foreground mb-4 size-12" />
                    <h2 className="text-xl font-semibold">No services available</h2>
                    <p className="text-muted-foreground max-w-xs text-center">We couldn&apos;t find any services at the moment. Please check back later.</p>
                </div>
            ) : (
                <div className="mt-6">
                    <CustomerServiceSearchGrid allServices={services as Service[]} />
                </div>
            )}

            {/* Footer hint */}
            {services.length > 0 && (
                <div className="mt-20 border-t border-zinc-100 pt-8 text-center text-zinc-400">
                    <p className="text-sm italic">Can&apos;t find what you are looking for? Try searching by category or keywords.</p>
                </div>
            )}
        </main>
    );
}

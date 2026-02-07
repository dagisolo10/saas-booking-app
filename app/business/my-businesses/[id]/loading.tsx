import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function LoadingBusinessPage() {
    return (
        <main className="mx-auto min-h-screen px-8 pt-8">
            {/* HERO SKELETON */}
            <div className="relative h-[40vh] w-full overflow-hidden rounded-xl">
                <Skeleton className="h-full w-full bg-zinc-200" />
                <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16">
                    <div className="container mx-auto space-y-4">
                        <Skeleton className="h-6 w-32 rounded-full bg-zinc-300/50" />
                        <Skeleton className="h-12 w-2/3 bg-zinc-300/50 md:h-16" />
                        <div className="flex gap-4">
                            <Skeleton className="h-8 w-24 rounded-full bg-zinc-300/50" />
                            <Skeleton className="h-8 w-40 bg-zinc-300/50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECONDARY IMAGES SKELETON */}
            <div className="mt-6 grid h-[30vh] grid-cols-2 gap-4">
                <Skeleton className="rounded-2xl bg-zinc-200" />
                <Skeleton className="rounded-2xl bg-zinc-200" />
            </div>

            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
                    {/* LEFT: Services Skeleton */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-md bg-zinc-200" />
                            <Skeleton className="h-8 w-48 bg-zinc-200" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-3xl bg-zinc-100" />
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Sidebar Skeleton */}
                    <div className="space-y-6">
                        <Card className="border-none bg-zinc-50">
                            <CardContent className="space-y-4 p-8">
                                <Skeleton className="h-6 w-1/2 bg-zinc-200" />
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                        <div key={i} className="flex justify-between">
                                            <Skeleton className="h-4 w-16 bg-zinc-200" />
                                            <Skeleton className="h-4 w-24 bg-zinc-200" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Skeleton className="h-40 w-full rounded-3xl bg-zinc-100" />
                    </div>
                </div>
            </div>
        </main>
    );
}

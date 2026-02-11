"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Store, Pause, Ban } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { BusinessStatus } from "@prisma/client";

interface Business {
    id: string;
    name: string;
    location: string | null;
    rating: number | null;
    bannerImages: string[];
    description: string | null;
    status: BusinessStatus;
}

interface BusinessGridProps {
    allBusinesses: Business[];
    topBusinesses: Business[];
    linkPath: string;
    placeholder: string;
}

export default function BusinessSearch({ allBusinesses, topBusinesses, linkPath, placeholder }: BusinessGridProps) {
    const [query, setQuery] = useState<string>("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(8);

    const handleSearchChange = (val: string) => {
        setQuery(val);
        setCurrentPage(1);
    };

    const displayBusinesses = query.trim().length > 0 ? allBusinesses.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()) || b.location?.toLowerCase().includes(query.toLowerCase())) : allBusinesses;

    const totalPages = Math.ceil(displayBusinesses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBusinesses = displayBusinesses.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8">
            {/* Search Bar Section */}
            <Card className="top-20 z-50 mx-auto my-8 max-w-2xl rounded-full border-zinc-200 py-1 shadow-lg ring-1 ring-black/5 sm:sticky">
                <CardContent className="flex items-center justify-between gap-2 px-4 py-2">
                    <SearchInput query={query} setQuery={handleSearchChange} placeholder={placeholder} />
                    <Separator />
                    <TopBusinessesDropdown businesses={topBusinesses.filter((bus) => bus.status !== "CLOSED")} linkPath={linkPath} />
                </CardContent>
            </Card>

            {/* Grid Section */}
            {paginatedBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedBusinesses.map((business, index) => (
                        <Link href={`${linkPath}/${business.id}`} key={business.id} className={`group`}>
                            <Card className="h-full gap-0 border-none bg-transparent shadow-none transition-all">
                                <CardHeader className="relative aspect-16/10 overflow-hidden rounded-lg bg-zinc-900 p-0">
                                    {business.bannerImages[0] && <Image priority={index < 4} className="object-cover transition-all duration-500 group-hover:scale-105" src={business.bannerImages[0]} alt={business.name} fill />}
                                    {!business.bannerImages[0] && (
                                        <div className="absolute inset-0 grid place-items-center text-gray-300">
                                            <div className="flex flex-col items-center gap-1">
                                                <Store />
                                                <h1 className="text-xl">No Image Preview</h1>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold backdrop-blur-sm">
                                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                        {(business.rating ?? 0).toFixed(1)}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between px-1 py-2 text-left">
                                    <div>
                                        <CardTitle className="group-hover:text-primary mb-1 transition-colors">{business.name}</CardTitle>
                                        <div className="text-muted-foreground flex items-center gap-1">
                                            <MapPin className="size-4" />
                                            <CardDescription className="line-clamp-1">{business.location ?? "No location listed"}</CardDescription>
                                        </div>
                                    </div>
                                    {business.status !== "ACTIVE" && (
                                        <div className={`${business.status === "PAUSED" ? "bg-blue-100 text-blue-500" : "bg-red-100 text-red-500"} flex items-center gap-1 rounded-lg px-2 py-1 text-sm lowercase`}>
                                            {business.status === "PAUSED" ? <Pause className="size-4" /> : <Ban className="size-4" />}
                                            <p>{business.status}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                    <Store className="mb-4 size-12 text-zinc-300" />
                    <h3 className="text-lg font-semibold text-zinc-600">No businesses match your search</h3>
                    <p className="text-muted-foreground text-sm">Try adjusting your keywords or location.</p>
                </div>
            )}

            {/* Pagination Section */}
            {totalPages > 0 && (
                <div className="mt-12 border-t pt-8">
                    <PaginationContainer itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
}

function PaginationContainer({ currentPage, totalPages, onPageChange, itemsPerPage, setItemsPerPage }: { currentPage: number; totalPages: number; itemsPerPage: number; setItemsPerPage: Dispatch<SetStateAction<number>>; onPageChange: (p: number) => void }) {
    return (
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page" className="text-muted-foreground text-sm font-medium">
                    Businesses per page
                </Label>
                <Select
                    onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        onPageChange(1);
                    }}
                    value={String(itemsPerPage)}
                >
                    <SelectTrigger className="w-20 rounded-full" id="rows-per-page">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[8, 16, 24, 32].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                                {num}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Pagination className="mx-0 w-auto">
                <PaginationContent>
                    <PaginationItem>
                        <Button variant="ghost" size="sm" disabled={currentPage === 1}>
                            <PaginationPrevious />
                        </Button>
                    </PaginationItem>

                    <div className="px-4 text-sm font-medium">
                        {currentPage} of {totalPages}
                    </div>

                    <PaginationItem>
                        <Button variant="ghost" size="sm" disabled={currentPage === totalPages}>
                            <PaginationNext />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

function SearchInput({ query, setQuery, placeholder }: { query: string; setQuery: (val: string) => void; placeholder: string }) {
    return (
        <div className="flex flex-1 items-center gap-3 px-2">
            <Search className="size-5 text-zinc-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} className="border-none shadow-none" placeholder={placeholder} />
        </div>
    );
}

function Separator() {
    return <div className="hidden h-6 border-l border-zinc-200 md:block" />;
}

function TopBusinessesDropdown({ businesses, linkPath }: { businesses: Business[]; linkPath: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden rounded-full font-semibold text-zinc-600 hover:bg-zinc-100 md:flex">
                    {businesses.length > 0 ? "Quick Browse Top" : "Loading..."}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-2xl p-2" align="end">
                <DropdownMenuLabel className="px-3 pt-2 text-xs font-bold tracking-widest text-zinc-400 uppercase">Top Rated Businesses</DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                {businesses.map((business) => (
                    <Link key={business.id} href={`${linkPath}/${business.id}`}>
                        <DropdownMenuItem className="flex cursor-pointer items-center gap-3 rounded-xl p-2 focus:bg-zinc-50">
                            <div className="relative size-10 overflow-hidden rounded-lg bg-zinc-600">
                                {business.bannerImages[0] ? (
                                    <Image src={business.bannerImages[0]} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="grid h-full place-items-center">
                                        <Store className="size-4" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-zinc-800">{business.name}</span>
                                <span className="line-clamp-1 text-xs text-zinc-500">{business.location}</span>
                            </div>
                            {business.status === "PAUSED" && <div className="ml-auto rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-500">Paused</div>}
                        </DropdownMenuItem>
                    </Link>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

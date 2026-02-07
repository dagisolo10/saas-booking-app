"use client";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Clock, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getTopServices } from "../_actions/get-services";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import RatingStars from "@/components/rating-stars";
import { useCustomer } from "./customer-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Service } from "@/lib/types";

export default function CustomerServiceSearchGrid({ allServices }: { allServices: Service[] }) {
    const { toggleService, selectedServices, replaceCart } = useCustomer();

    const [topServices, setTopServices] = useState<Service[]>([]);
    const [query, setQuery] = useState<string>("");

    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const [newlySelected, setNewlySelected] = useState<Service | null>(null);
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(8);

    useEffect(() => {
        async function fetchTop() {
            try {
                const top = await getTopServices();
                if (!("error" in top)) setTopServices(top as Service[]);
            } catch (error) {
                console.error("Failed to fetch top services:", error);
            }
        }
        fetchTop();
    }, []);

    const handleSearchChange = (val: string) => {
        setQuery(val);
        setCurrentPage(1);
    };

    const handleServiceClick = (e: React.MouseEvent, service: Service) => {
        e.preventDefault();
        const isDifferentBusiness = selectedServices.length > 0 && selectedServices[0].businessId !== service.businessId;
        if (isDifferentBusiness) {
            setNewlySelected(service);
            setShowConfirm(true);
        } else {
            toggleService(service);
            toast.success("Added to cart", { description: `${service.name} is now in your selection.` });
            router.push(`/customer/businesses/${service.businessId}/cart`);
        }
    };

    const displayServices = query.trim().length > 0 ? allServices.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())) : allServices;

    const totalPages = Math.ceil(displayServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedServices = displayServices.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-8">
            {/* Search Bar Section */}
            <Card className="top-18 z-50 mx-auto my-8 max-w-2xl rounded-full border-zinc-200 py-1 shadow-lg ring-1 ring-black/5 sm:sticky">
                <CardContent className="flex items-center justify-between gap-2 p-2 px-4">
                    <SearchInput query={query} setQuery={handleSearchChange} />
                    <Separator />
                    <TopServicesDropdown handleServiceClick={handleServiceClick} services={topServices} />
                </CardContent>
            </Card>
            {/* Grid Section */}
            {paginatedServices.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedServices.map((service) => (
                        <Link onClick={(e) => handleServiceClick(e, service)} href={`/customer/businesses/${service.businessId}/cart`} key={service.id} className="group">
                            <Card className="h-full gap-0 border-none bg-transparent shadow-none transition-all">
                                <CardHeader className="relative aspect-16/10 overflow-hidden rounded-lg bg-zinc-100 p-0">
                                    <Image className="object-cover transition-all duration-500 group-hover:scale-105" src={service.thumbnail ?? "/unsplash.jpg"} alt={service.name} fill />
                                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-zinc-800 backdrop-blur-sm">${service.price}</div>
                                </CardHeader>
                                <CardContent className="px-1 py-2 text-left">
                                    <CardTitle className="group-hover:text-primary mb-1 transition-colors">{service.name}</CardTitle>
                                    <div className="flex flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
                                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                            <Clock className="size-3.5" />
                                            <span>{service.duration} mins</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <RatingStars rating={service.rating ?? 0} />({service.rating})
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                    <Sparkles className="mb-4 size-12 text-zinc-300" />
                    <h3 className="text-lg font-semibold text-zinc-600">No services found</h3>
                    <p className="text-muted-foreground text-sm">Try searching for something else, like &quot;Haircut&quot; or &quot;Consultation&quot;.</p>
                </div>
            )}
            {/* Pagination Section */}
            {totalPages > 0 && (
                <div className="mt-12 border-t pt-8">
                    <PaginationContainer itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
            <ConfirmationPopup
                showConfirm={showConfirm}
                onConfirm={() => {
                    if (newlySelected) {
                        replaceCart(newlySelected);
                        router.push(`/customer/businesses/${newlySelected.businessId}/cart`);
                        toast.success("Added to cart", { description: `${newlySelected.name} is now in your selection.` });
                    }
                    setShowConfirm(false);
                }}
                onCancel={() => {
                    setShowConfirm(false);
                    setNewlySelected(null);
                }}
                setShowConfirm={setShowConfirm}
            />
        </div>
    );
}

function PaginationContainer({ currentPage, totalPages, onPageChange, itemsPerPage, setItemsPerPage }: { currentPage: number; totalPages: number; itemsPerPage: number; setItemsPerPage: Dispatch<SetStateAction<number>>; onPageChange: (p: number) => void }) {
    return (
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page" className="text-muted-foreground text-sm font-medium">
                    Services per page
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
                <PaginationContent className="gap-4">
                    <PaginationItem>
                        <Button variant="ghost" size="sm" className="rounded-full" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                            Previous
                        </Button>
                    </PaginationItem>

                    <div className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold">
                        {currentPage} <span className="mx-1 font-normal text-zinc-400">of</span> {totalPages}
                    </div>

                    <PaginationItem>
                        <Button variant="ghost" size="sm" className="rounded-full" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                            Next
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

function SearchInput({ query, setQuery }: { query: string; setQuery: (val: string) => void }) {
    return (
        <div className="flex flex-1 items-center gap-3 px-2">
            <Search className="size-5 text-zinc-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 rounded-full border-none bg-transparent text-base shadow-none focus-visible:ring-0" placeholder="What service are you looking for?" />
        </div>
    );
}

function Separator() {
    return <div className="hidden h-6 border-l border-zinc-200 md:block" />;
}

function TopServicesDropdown({ services, handleServiceClick }: { services: Service[]; handleServiceClick: (e: React.MouseEvent, service: Service) => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden rounded-full font-semibold text-zinc-600 hover:bg-zinc-100 md:flex">
                    {services.length > 0 ? "Popular Services" : "Loading..."}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-2xl p-2" align="end">
                <DropdownMenuLabel className="px-3 pt-2 text-xs font-bold tracking-widest text-zinc-400 uppercase">Trending Right Now</DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                {services.map((service) => (
                    <Link key={service.id} onClick={(e) => handleServiceClick(e, service)} href={`/customer/businesses/${service.businessId}/cart`}>
                        <DropdownMenuItem className="flex cursor-pointer items-center gap-3 rounded-xl p-2 focus:bg-zinc-50">
                            <div className="relative size-10 overflow-hidden rounded-lg bg-zinc-100">
                                <Image src={service.thumbnail ?? "/unsplash.jpg"} alt="" fill className="object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="line-clamp-1 font-bold text-zinc-800">{service.name}</span>
                                <span className="text-[10px] text-zinc-500">${service.price}</span>
                            </div>
                        </DropdownMenuItem>
                    </Link>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface ConfirmationProp {
    showConfirm: boolean;
    setShowConfirm: Dispatch<SetStateAction<boolean>>;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmationPopup({ showConfirm, onConfirm, setShowConfirm, onCancel }: ConfirmationProp) {
    return (
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Start a new booking?</AlertDialogTitle>
                    <AlertDialogDescription>You have items from a different business in your cart. Booking this will clear your current selection and start fresh.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} className="text-xs">
                        Keep current selection
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="text-xs">
                        Reset & Book Service
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

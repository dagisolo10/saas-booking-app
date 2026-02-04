"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getAllServices, getTopServices } from "../_actions/get-top-services";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Service } from "@prisma/client";

interface SearchInputProps {
    placeholder: string;
    query: string;
    setQuery: Dispatch<SetStateAction<string>>;
}

export default function ServiceSearchGrid() {
    const [topServices, setTopServices] = useState<Service[]>([]);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [query, setQuery] = useState<string>("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(8);

    useEffect(() => {
        async function fetchAllServices() {
            try {
                const services = await getAllServices();
                const topServices = await getTopServices();
                setTopServices(topServices);
                setAllServices(services);
            } catch (error) {
                console.error("Failed to fetch services:", error);
            }
        }
        fetchAllServices();
    }, []);

    const displayServices = query.trim().length > 0 ? allServices.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())) : topServices;

    const totalPages = Math.ceil(displayServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedServices = displayServices.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [query]);

    return (
        <div className="space-y-8">
            <Card className="mx-auto my-12 max-w-2xl rounded-full py-2">
                <CardContent className="flex items-center justify-between gap-4">
                    <SearchInput query={query} setQuery={setQuery} placeholder="Search services..." />
                    <Separator />
                    <DropDown services={topServices} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-4">
                {paginatedServices.length > 0 ? (
                    paginatedServices.map((service) => (
                        <Card key={service.id} className="gap-0 border-none shadow-none transition-all hover:shadow-md">
                            <CardHeader className="overflow-hidden">
                                <Image className="rounded-sm transition-all duration-300 hover:scale-102" src={service.thumbnail ?? "/unsplash.jpg"} alt="" width={720} height={300} />
                            </CardHeader>
                            <CardContent className="text-left">
                                <CardTitle className="text-lg">{service.name}</CardTitle>
                                <CardDescription>{service.price} USD</CardDescription>
                                <CardDescription>{service.duration} mins</CardDescription>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted-foreground mt-10">No services match your search.</p>
                )}
            </div>

            <div className="mb-8">
                <PaginationContainer itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
}

function PaginationContainer({ currentPage, totalPages, onPageChange, itemsPerPage, setItemsPerPage }: { currentPage: number; totalPages: number; itemsPerPage: number; setItemsPerPage: Dispatch<SetStateAction<number>>; onPageChange: (p: number) => void }) {
    return (
        <div className="grid grid-cols-3">
            <div className="flex items-center gap-2">
                <Label htmlFor="select-rows-per-page" className="text-sm">
                    Rows per page
                </Label>
                <Select
                    onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        onPageChange(1);
                    }}
                    value={String(itemsPerPage)}
                >
                    <SelectTrigger className="w-17.5" id="select-rows-per-page">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent align="start">
                        <SelectGroup>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="16">16</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="32">32</SelectItem>
                            <SelectItem value="64">64</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} />
                    </PaginationItem>

                    {totalPages > 1 && (
                        <PaginationItem>
                            <PaginationLink isActive={currentPage === 1} onClick={() => onPageChange(1)}>
                                {1}
                            </PaginationLink>
                        </PaginationItem>
                    )}

                    <div className="px-4 text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </div>

                    {totalPages > 1 && (
                        <PaginationItem>
                            <PaginationLink isActive={currentPage === totalPages} onClick={() => onPageChange(totalPages)}>
                                {totalPages}
                            </PaginationLink>
                        </PaginationItem>
                    )}

                    <PaginationItem>
                        <PaginationNext onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
            <div />
        </div>
    );
}

function Separator() {
    return <div className="border-border h-8 border-l" />;
}

function SearchInput({ placeholder, query, setQuery }: SearchInputProps) {
    return (
        <div className="flex flex-1 items-center gap-2 px-4">
            <Label htmlFor="search">
                <Search className="text-muted-foreground size-5" />
            </Label>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-full border-none shadow-none focus-visible:ring-0" placeholder={placeholder} id="search" />
        </div>
    );
}

function DropDown({ services }: { services: Service[] }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full">
                    {services.length > 0 ? "See Top Services" : "Loading..."}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Top services</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {services.length > 0 ? (
                    services.map((service) => (
                        <DropdownMenuItem key={service.id} className="cursor-pointer">
                            {service.name}
                        </DropdownMenuItem>
                    ))
                ) : (
                    <div className="text-muted-foreground p-2 text-sm">No services found</div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

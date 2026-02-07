"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import RatingStars from "@/components/rating-stars";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Business } from "@prisma/client";
import { useCustomer } from "./customer-context";
import { toast } from "sonner";
import { Service } from "@/lib/types";

export default function ServiceListWithSelected({ business, services }: { services: Service[]; business: Business }) {
    const [activeCategory, setActiveCategory] = useState("Featured");

    const { selectedServices, removeService, toggleService } = useCustomer();
    const total = selectedServices.reduce((acc, curr) => acc + curr.price, 0);

    const isAdded = (id: string) => selectedServices.find((s) => s.id === id);

    const featuredServices = useMemo(() => [...services].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4), [services]);
    const dbCategories = useMemo(() => Array.from(new Set(services.map((s) => s.category))), [services]);
    const allTabs = useMemo(() => ["Featured", ...dbCategories], [dbCategories]);
    const isClickScrolling = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (isClickScrolling.current) return;
                const visibleEntry = entries.find((entry) => entry.isIntersecting);
                if (visibleEntry) setActiveCategory(visibleEntry.target.id);
            },
            { threshold: 0.2, rootMargin: "-120px 0px -50% 0px" },
        );

        allTabs.forEach((tab) => {
            const el = document.getElementById(tab);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [allTabs]);

    const scrollToCategory = (cat: string) => {
        isClickScrolling.current = true;
        setActiveCategory(cat);

        const el = document.getElementById(cat);
        if (el) {
            const offset = 140;
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
        }
        setTimeout(() => (isClickScrolling.current = false), 800);
    };

    const handleServiceClick = (service: Service) => {
        const isCurrentlySelected = isAdded(service.id);

        toggleService(service);

        if (isCurrentlySelected) {
            toast("Removed from cart", { description: `${service.name} has been taken off your list.` });
        } else {
            toast.success("Added to cart", { description: `${service.name} is now in your selection.` });
        }
    };

    return (
        <main className="mx-auto min-h-screen px-8">
            <div className="relative container py-4">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                    {/* LEFT SIDE: Client Component handles scrollspy/carousel */}
                    <div className="col-span-2 space-y-4">
                        {/* Category Carousel */}
                        <div className="bg-background/50 sticky top-16 z-30 py-4 backdrop-blur-lg">
                            <div className="max-w-10/12">
                                <Carousel className="w-full" opts={{ align: "start", dragFree: true }}>
                                    <CarouselContent>
                                        {allTabs.map((cat) => (
                                            <CarouselItem key={cat} className="basis-auto pl-0">
                                                <Button variant="ghost" onClick={() => scrollToCategory(cat)} className={`relative rounded-full px-6 font-bold transition-colors ${activeCategory === cat ? "text-white" : "text-muted-foreground"}`}>
                                                    {activeCategory === cat && <motion.div layoutId="active-pill" className="absolute inset-0 z-[-1] rounded-full bg-black" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                                                    {cat}
                                                </Button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-8">
                            {allTabs.map((tab) => {
                                const displayServices = tab === "Featured" ? featuredServices : services.filter((s) => s.category === tab);

                                if (displayServices.length === 0) return null;

                                return (
                                    <section key={tab} id={tab}>
                                        <h2 className="mb-4 text-xl font-extrabold tracking-tight">{tab}</h2>
                                        <div className="grid gap-4">
                                            {displayServices.map((service) => (
                                                <Card key={`${tab}-${service.id}`} className={`hover:bg-muted/50 border-b transition-colors ${isAdded(service.id) && "border-primary border-2"}`}>
                                                    <CardContent className="flex items-center justify-between px-6">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold">{service.name}</h3>
                                                            <p className="text-muted-foreground text-xs">{service.duration} min</p>
                                                            <p className="mt-1 text-sm font-semibold">${service.price}</p>
                                                        </div>
                                                        <Button variant={`ghost`} onClick={() => handleServiceClick(service)} className={`size-8 rounded-full ${isAdded(service.id) ? "bg-primary text-white" : ""} `}>
                                                            {isAdded(service.id) ? <Check /> : <Plus className="size-4" />}
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: Sidebar Info */}
                    <div className="sticky top-20">
                        <Card className="border-none">
                            <CardHeader className="grid grid-cols-3">
                                <Image src={business.bannerImages[0]} alt={business.name} width={1080} height={300} className="col-span-1 h-full rounded-md object-cover object-top brightness-50" priority />
                                <div className="col-span-2 text-left">
                                    <CardTitle className="text-xl font-bold">{business.name}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-semibold">{business.rating?.toFixed(1)}</span>
                                        <RatingStars rating={business.rating ?? 0} />
                                        <span className="font-medium">({business.reviewCount} Reviews)</span>
                                    </div>
                                    <CardContent className="px-0">{business.location}</CardContent>
                                </div>
                            </CardHeader>
                            <CardContent className="h-64 overflow-y-auto">
                                {selectedServices.length > 0 ? (
                                    <div>
                                        <div className="space-y-4">
                                            {selectedServices.map((service) => (
                                                <div className="flex items-center justify-between border-b pb-2 first:border-t first:pt-2 last:border-b-0" key={service.id}>
                                                    <div>
                                                        <h3 className="text-sm font-semibold">{service.name}</h3>
                                                        <p className="text-muted-foreground text-xs">{service.duration} min</p>
                                                        <p className="mt-1 text-xs font-semibold">${service.price}</p>
                                                    </div>
                                                    <Button className="opacity-50" variant={`ghost`} onClick={() => removeService(service)}>
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="sticky bottom-0 flex items-center justify-between border-t bg-white py-4">
                                            <CardTitle>Total</CardTitle>
                                            <CardTitle>${total.toFixed(2)}</CardTitle>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <CardDescription className="mb-4">No services selected</CardDescription>
                                        <div className="flex items-center justify-between border-t py-4">
                                            <CardTitle>Total</CardTitle>
                                            <CardTitle>Free</CardTitle>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button className="w-full rounded-full bg-black py-3">Continue</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}

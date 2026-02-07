"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { ServiceDialog } from "./service-dialog";
import { Layers, Plus } from "lucide-react";

interface Service {
    id: string;
    name: string;
    duration: number;
    category: string;
    price: number;
    rating: number;
    businessId: string;
    thumbnail: string;
}
interface SelectedService {
    name: string;
    duration: number;
    price: number;
    category: string;
    serviceId: string;
    thumbnail: string;
}

export default function MyServiceList({ services }: { services: Service[] }) {
    const [activeCategory, setActiveCategory] = useState("Featured");
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedService, setSelectedService] = useState<SelectedService>();

    const featuredServices = useMemo(() => [...services].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5), [services]);

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

    return (
        <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="flex items-center justify-between">
                <div className="mb-8 flex items-center gap-3">
                    <Layers className="text-primary" />
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Available Services</h2>
                </div>
                <Button onClick={() => setIsAdding(true)} className="rounded-full shadow-lg">
                    <Plus className="mr-1 size-4" />
                    Add a Service
                </Button>
            </div>

            {services.length > 0 ? (
                // <MyServiceList services={services} />
                <div className="col-span-2 space-y-4">
                    <CategoryCarousel allTabs={allTabs} activeCategory={activeCategory} scrollToCategory={scrollToCategory} />
                    <div className="space-y-8">
                        {allTabs.map((tab) => {
                            const displayServices = tab === "Featured" ? featuredServices : services.filter((s) => s.category === tab);

                            if (displayServices.length === 0) return null;

                            return (
                                <section key={tab} id={tab}>
                                    <h2 className="mb-4 text-xl font-extrabold tracking-tight">{tab}</h2>
                                    <div className="grid gap-4">
                                        {displayServices.map((service) => (
                                            <Card key={`${tab}-${service.id}`} className="hover:bg-muted/50 border-b transition-colors">
                                                <CardContent className="flex items-center justify-between px-6">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{service.name}</h3>
                                                        <p className="text-muted-foreground text-xs">{service.duration} min</p>
                                                        <p className="mt-1 text-sm font-semibold">${service.price}</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Button
                                                            onClick={() => {
                                                                setIsEditing(true);
                                                                setSelectedService({ name: service.name, duration: service.duration, price: service.price, category: service.category, serviceId: service.id, thumbnail: service.thumbnail });
                                                            }}
                                                            variant="ghost"
                                                            className="cursor-pointer rounded-full text-xs transition-all"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button variant="ghost" className="cursor-pointer rounded-full text-xs transition-all">
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                    {isEditing && <ServiceDialog mode="edit" dialog={isEditing} setDialog={setIsEditing} data={selectedService} />}
                    {isAdding && <ServiceDialog businessId={services[0].businessId} dialog={isAdding} setDialog={setIsAdding} />}
                </div>
            ) : (
                <div className="rounded-3xl border-2 border-dashed p-12 text-center">
                    <p className="text-muted-foreground">No services listed yet.</p>
                </div>
            )}
        </div>
    );
}

interface CarouselProp {
    allTabs: string[];
    activeCategory: string;
    scrollToCategory: (cat: string) => void;
}

function CategoryCarousel({ allTabs, activeCategory, scrollToCategory }: CarouselProp) {
    return (
        <div className="bg-background/50 top-16 z-50 py-4 backdrop-blur-lg sm:sticky">
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
    );
}

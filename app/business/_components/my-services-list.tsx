"use client";
import { useEffect, useState, useRef, useMemo, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { ServiceDialog } from "./service-dialog";
import { Layers, Plus } from "lucide-react";
import deleteService from "../my-businesses/[id]/_actions/delete-service";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

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

export default function MyServiceList({ services, businessId }: { services: Service[]; businessId?: string }) {
    const [activeCategory, setActiveCategory] = useState("Featured");
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const [selectedService, setSelectedService] = useState<SelectedService>();
    const [targetService, setTargetService] = useState<Service | null>(null);
    const resolvedBusinessId = businessId ?? services[0]?.businessId;

    const featuredServices = useMemo(() => [...services].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5), [services]);

    const dbCategories = useMemo(() => Array.from(new Set(services.map((s) => s.category))), [services]);
    const allTabs = useMemo(() => ["Featured", ...dbCategories], [dbCategories]);
    const isClickScrolling = useRef(false);

    const supabase = createClient();

    async function handleDelete(service: Service) {
        setIsDeleting(true);

        const processDelete = async () => {
            const result = await deleteService(service.id);

            if (result && "error" in result) throw new Error(result.message);

            if (service.thumbnail) {
                const { error: storageError } = await supabase.storage.from("banners").remove([service.thumbnail]);
                if (storageError) {
                    const message = storageError.message ?? "Storage deletion failed";
                    throw new Error(message);
                }
            }
            return result;
        };

        await toast.promise(processDelete(), {
            loading: "Deleting Service...",
            success: "Service Deleted Successfully!",
            error: (err) => err.message || "Failed to delete service.",
            finally: () => setIsDeleting(false),
        });
    }

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "-40% 0px -30% 0px",
            threshold: 0,
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            if (isClickScrolling.current) return;

            const intersecting = entries.filter((entry) => entry.isIntersecting);
            if (intersecting.length > 0) {
                const mostVisible = intersecting.reduce((prev, current) => (prev.intersectionRatio > current.intersectionRatio ? prev : current));
                setActiveCategory(mostVisible.target.id);
            }
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

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
                <div className="col-span-2 space-y-4">
                    <CategoryCarousel allTabs={allTabs} activeCategory={activeCategory} scrollToCategory={scrollToCategory} />
                    <div className="space-y-8">
                        {allTabs.map((tab) => {
                            const displayServices = tab === "Featured" ? featuredServices : services.filter((s) => s.category === tab);

                            if (displayServices.length === 0) return null;

                            return (
                                <section key={tab} id={tab} className="scroll-mt-40">
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
                                                        <Button
                                                            disabled={isDeleting}
                                                            onClick={() => {
                                                                setTargetService(service);
                                                                setShowConfirm(true);
                                                            }}
                                                            variant="ghost"
                                                            className="cursor-pointer rounded-full text-xs transition-all"
                                                        >
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
                </div>
            ) : (
                <div className="rounded-3xl border-2 border-dashed p-12 text-center">
                    <p className="text-muted-foreground">No services listed yet.</p>
                </div>
            )}
            {isAdding && resolvedBusinessId && <ServiceDialog businessId={resolvedBusinessId} dialog={isAdding} setDialog={setIsAdding} />}
            <DeleteConfirmation
                showConfirm={showConfirm}
                onConfirm={() => {
                    if (targetService) handleDelete(targetService);
                    setTargetService(null);
                    setShowConfirm(false);
                }}
                setShowConfirm={setShowConfirm}
            />
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

interface DeleteConfirmationProps {
    showConfirm: boolean;
    setShowConfirm: Dispatch<SetStateAction<boolean>>;
    onConfirm: () => void;
}

function DeleteConfirmation({ showConfirm, onConfirm, setShowConfirm }: DeleteConfirmationProps) {
    return (
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Service?</AlertDialogTitle>
                    <AlertDialogDescription>Are you sure you want to delete this service? This action cannot be undone and it will be removed from your business immediately.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} variant={`destructive`}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

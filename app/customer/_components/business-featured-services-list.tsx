"use client";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useCustomer } from "./customer-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Service } from "@/lib/types";

export default function FeaturedServiceList({ services }: { services: Service[] }) {
    const { toggleService, selectedServices, resetCart, replaceCart } = useCustomer();

    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [forBooking, setForBooking] = useState<boolean>(false);
    const [newlySelected, setNewlySelected] = useState<Service | null>(null);
    const router = useRouter();

    const featuredServices = useMemo(() => [...services].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5), [services]);

    const isCartEmpty = selectedServices.length === 0;
    const isDifferentBusiness = !isCartEmpty && selectedServices[0]?.businessId !== services[0]?.businessId;

    const buttonLabel = !isCartEmpty && !isDifferentBusiness ? "See My Selection" : "See All";
    const buttonVariant = isDifferentBusiness ? "outline" : "default";

    const handleSeeAll = (e: React.MouseEvent) => {
        const isDifferentBusiness = selectedServices.length > 0 && selectedServices[0]?.businessId !== services[0]?.businessId;
        if (isDifferentBusiness) {
            e.preventDefault();
            setShowConfirm(true);
        }
    };

    const handleServiceBook = (e: React.MouseEvent, service: Service) => {
        e.preventDefault();
        const isDifferentBusiness = selectedServices.length > 0 && selectedServices[0].businessId !== service.businessId;
        if (isDifferentBusiness) {
            setNewlySelected(service);
            setForBooking(true);
            setShowConfirm(true);
        } else {
            toggleService(service);
            toast.success(`Added a new booking with ${service.name}`);
            router.push(`/customer/businesses/${service.businessId}/cart`);
        }
    };

    return (
        <div>
            <div className="space-y-4">
                {featuredServices.length > 0 ? (
                    featuredServices.map((service) => (
                        <Card key={service.id} className="hover:bg-muted/50 border-b transition-colors">
                            <CardContent className="flex items-center justify-between px-6">
                                <div className="flex-1">
                                    <h3 className="font-semibold">{service.name}</h3>
                                    <p className="text-muted-foreground text-xs">{service.duration} min</p>
                                    <p className="mt-1 text-sm font-semibold">${service.price}</p>
                                </div>
                                <Link onClick={(e) => handleServiceBook(e, service)} href={`/customer/businesses/${service.businessId}/cart`}>
                                    <Button variant="outline" className="rounded-full">
                                        Book
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                        <Sparkles className="mb-4 size-12 text-zinc-300" />
                        <h3 className="text-lg font-semibold text-zinc-600">No services found</h3>
                        <p className="text-muted-foreground text-sm">Try searching for something else, like &quot;Haircut&quot; or &quot;Consultation&quot;.</p>
                    </div>
                )}
            </div>
            <Link onClick={(e) => handleSeeAll(e)} href={`/customer/businesses/${services[0].businessId}/cart`}>
                <Button className="mt-6 rounded-full bg-black hover:bg-zinc-800" variant={buttonVariant}>
                    {buttonLabel}
                </Button>
            </Link>

            <ConfirmationPopup
                forBooking={forBooking}
                showConfirm={showConfirm}
                onConfirm={() => {
                    if (forBooking && newlySelected) {
                        replaceCart(newlySelected);
                        toast.success("Added to cart", { description: `${newlySelected.name} is now in your selection.` });
                    } else resetCart();
                    router.push(`/customer/businesses/${services[0].businessId}/cart`);

                    setShowConfirm(false);
                    setForBooking(false);
                    setNewlySelected(null);
                }}
                onCancel={() => {
                    setShowConfirm(false);
                    setForBooking(false);
                    setNewlySelected(null);
                }}
                setShowConfirm={setShowConfirm}
            />
        </div>
    );
}

interface ConfirmationProp {
    showConfirm: boolean;
    setShowConfirm: Dispatch<SetStateAction<boolean>>;
    onConfirm: () => void;
    onCancel: () => void;
    forBooking: boolean;
}

function ConfirmationPopup({ showConfirm, onConfirm, onCancel, setShowConfirm, forBooking }: ConfirmationProp) {
    const title = forBooking ? "Start a new booking?" : "Switch to this businesses?";
    const description = forBooking ? "Start a fresh booking with this service" : "You have items from a different business in your cart. Moving here will clear those items and start a fresh session for this business.";
    const cancel = forBooking ? "Keep current selection" : "Keep my current cart";
    const confirm = forBooking ? "Reset & Book Service" : "Confirm & Switch";

    return (
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} className="text-xs">
                        {cancel}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="text-xs">
                        {confirm}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

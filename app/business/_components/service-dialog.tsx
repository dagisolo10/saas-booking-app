"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, SyntheticEvent, useRef, useState } from "react";
import updateService from "../my-businesses/[id]/_actions/update-service";
import { toast } from "sonner";

interface DialogProp {
    dialog: boolean;
    setDialog: Dispatch<SetStateAction<boolean>>;
    mode?: "edit" | "add";
    data?: Data;
}

interface Data {
    name: string;
    duration: number;
    price: number;
    category: string;
    serviceId: string;
    thumbnail: string;
}

interface Form {
    name: HTMLInputElement | null;
    price: HTMLInputElement | null;
    duration: HTMLInputElement | null;
    category: HTMLInputElement | null;
    thumbnail: HTMLInputElement | null;
}

export function ServiceDialog({ dialog, setDialog, mode = "add", data }: DialogProp) {
    const addDesc = "Create a new offering for your clients. Fill in the details below to list this service on your booking profile.";
    const editDesc = "Update the details of your service. These changes will reflect on your business page immediately.";

    const addBtn = "Add Service";
    const editBtn = "Save Changes";

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const formRef = useRef<Form>({ name: null, price: null, duration: null, category: null, thumbnail: null });

    async function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const submittedData: Data = {
                name: formRef.current.name?.value ?? "",
                price: Number(formRef.current.price?.value) ?? 0,
                duration: Number(formRef.current.duration?.value) ?? 0,
                category: formRef.current.category?.value ?? "",
                thumbnail: formRef.current.thumbnail?.value ?? "",
                serviceId: data?.serviceId ?? "",
            };
            await toast.promise(updateService(submittedData), {
                loading: mode === "add" ? "Adding..." : "Updating...",
                success: `${submittedData.name} has been created`,
                error: "Failed to update service",
            });
        } finally {
            setIsLoading(false);
        }
        setDialog(false);
    }

    return (
        <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogContent className="sm:max-w-125">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="mb-4">
                        <DialogTitle>{mode === "add" ? "Add" : "Edit"} Service</DialogTitle>
                        <DialogDescription>{mode === "add" ? addDesc : editDesc}</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="service-name">Service Name</Label>
                                <Input
                                    ref={(el) => {
                                        formRef.current.name = el as HTMLInputElement;
                                    }}
                                    defaultValue={mode === "edit" ? data?.name : undefined}
                                    id="service-name"
                                    placeholder="e.g. Men's Haircut"
                                />
                            </Field>
                            <Field>
                                <Label htmlFor="service-price">Price ($)</Label>
                                <Input
                                    ref={(el) => {
                                        formRef.current.price = el as HTMLInputElement;
                                    }}
                                    defaultValue={mode === "edit" ? data?.price : undefined}
                                    id="service-price"
                                    type="number"
                                    placeholder="0.00"
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="service-duration">Duration (min)</Label>
                                <Input
                                    ref={(el) => {
                                        formRef.current.duration = el as HTMLInputElement;
                                    }}
                                    defaultValue={mode === "edit" ? data?.duration : undefined}
                                    id="service-duration"
                                    type="number"
                                    placeholder="30"
                                />
                            </Field>
                            <Field>
                                <Label htmlFor="service-category">Category</Label>
                                <Input
                                    ref={(el) => {
                                        formRef.current.category = el as HTMLInputElement;
                                    }}
                                    defaultValue={mode === "edit" ? data?.category : undefined}
                                    id="service-category"
                                    placeholder="e.g. Hair"
                                />
                            </Field>
                        </div>

                        <Field>
                            <Label htmlFor="service-thumbnail">Thumbnail Image</Label>
                            <Input id="service-thumbnail" type="file" accept="image/*" className="cursor-pointer file:cursor-pointer file:font-semibold" />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="mt-8">
                        <DialogClose asChild>
                            <Button disabled={isLoading} variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button disabled={isLoading} type="submit">
                            {mode === "add" ? addBtn : editBtn}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function SonnerTypes() {
    return (
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast("Event has been created")}>
                Default
            </Button>
            <Button variant="outline" onClick={() => toast.success("Event has been created")}>
                Success
            </Button>
            <Button variant="outline" onClick={() => toast.info("Be at the area 10 minutes before the event time")}>
                Info
            </Button>
            <Button variant="outline" onClick={() => toast.warning("Event start time cannot be earlier than 8am")}>
                Warning
            </Button>
            <Button variant="outline" onClick={() => toast.error("Event has not been created")}>
                Error
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    toast.promise<{ name: string }>(() => new Promise((resolve) => setTimeout(() => resolve({ name: "Event" }), 2000)), {
                        loading: "Loading...",
                        success: (data) => `${data.name} has been created`,
                        error: "Error",
                    });
                }}
            >
                Promise
            </Button>
        </div>
    );
}

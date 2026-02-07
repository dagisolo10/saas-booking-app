"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, SyntheticEvent, useEffect, useState } from "react";
import updateService from "../my-businesses/[id]/_actions/update-service";
import { toast } from "sonner";
import Image from "next/image";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import createService from "../my-businesses/[id]/_actions/create-service";

interface DialogProp {
    dialog: boolean;
    setDialog: Dispatch<SetStateAction<boolean>>;
    mode?: "edit" | "add";
    data?: Data;
    businessId?: string;
}

interface Data {
    name: string;
    duration: number;
    price: number;
    category: string;
    serviceId: string;
    thumbnail: string;
}

interface ServiceCreation {
    name: string;
    duration: number;
    price: number;
    businessId: string;
    thumbnail: string;
    category: string;
}

export function ServiceDialog({ dialog, setDialog, mode = "add", data, businessId }: DialogProp) {
    const addDesc = "Create a new offering for your clients. Fill in the details below to list this service on your booking profile.";
    const editDesc = "Update the details of your service. These changes will reflect on your business page immediately.";

    const addBtn = "Add Service";
    const editBtn = "Save Changes";

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

    // Inside ServiceDialog component
    const supabase = createClient();

    // Force the existing thumbnail to update whenever the 'data' prop or 'dialog' state changes
    useEffect(() => {
        if (dialog && mode === "edit" && data?.thumbnail) {
            if (data.thumbnail.startsWith("http")) {
                setExistingThumbnailUrl(data.thumbnail);
            } else {
                const {
                    data: { publicUrl },
                } = supabase.storage.from("banners").getPublicUrl(data.thumbnail);
                setExistingThumbnailUrl(publicUrl);
            }
        } else if (!dialog) {
            // Clear everything when dialog closes
            setExistingThumbnailUrl(null);
            setPreview(null);
            setSelectedFile(null);
        }
    }, [data, mode, dialog, supabase.storage]); // Notice 'dialog' is a dependency now

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (preview) URL.revokeObjectURL(preview);

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));

        e.target.value = "";
    };

    const clearImage = () => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setSelectedFile(null);
    };

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const supabase = createClient();

        const process = async () => {
            let uploaded = data?.thumbnail || "";

            try {
                if (selectedFile) {
                    const fileExt = selectedFile.name.split(".").pop();
                    const fileName = `${selectedFile.name.split(".")[0]}-${Date.now()}.${fileExt}`;
                    const filePath = `service/${fileName}`;

                    const { error: uploadError } = await supabase.storage.from("banners").upload(filePath, selectedFile);
                    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

                    if (selectedFile && data?.thumbnail) {
                        // Delete the old file since we have a new one
                        await supabase.storage.from("banners").remove([data.thumbnail]);
                    }

                    uploaded = filePath;
                }
                const finalThumbnail = (selectedFile ? uploaded : data?.thumbnail) || "";

                if (mode === "edit") {
                    const serviceToBeUpdated: Data = {
                        name: String(formData.get("name")),
                        price: Number(formData.get("price")),
                        duration: Number(formData.get("duration")),
                        category: String(formData.get("category")),
                        thumbnail: finalThumbnail,
                        serviceId: data?.serviceId ?? "",
                    };

                    const result = await updateService(serviceToBeUpdated);

                    if (result && "error" in result) throw new Error(result.message);

                    clearImage();
                    setDialog(false);
                    return result;
                } else {
                    const serviceToBeAdded: ServiceCreation = {
                        name: String(formData.get("name")),
                        price: Number(formData.get("price")),
                        duration: Number(formData.get("duration")),
                        category: String(formData.get("category")),
                        thumbnail: uploaded,
                        businessId: businessId ?? "",
                    };
                    const result = await createService(serviceToBeAdded);

                    if (result && "error" in result) throw new Error(result.message);

                    clearImage();
                    setDialog(false);
                    return result;
                }
            } catch (error) {
                if (uploaded && uploaded !== data?.thumbnail) await supabase.storage.from("banners").remove([uploaded]);

                throw error;
            }
        };

        await toast.promise(process(), {
            loading: mode === "add" ? "Adding..." : "Updating...",
            success: `${mode === "add" ? "Service Added Successfully!" : "Service Updated Successfully!"}`,
            error: (err) => err.message || `Failed to ${mode === "add" ? "add" : "update"} service.`,
            finally: () => setIsLoading(false),
        });
    }

    return (
        <Dialog
            open={dialog}
            onOpenChange={(open) => {
                setDialog(open);
                if (!open) clearImage();
            }}
        >
            <DialogContent className="sm:max-w-125">
                <form onSubmit={handleSubmit} key={mode === "add" ? "add-form" : data?.serviceId}>
                    <DialogHeader className="mb-4">
                        <DialogTitle>{mode === "add" ? "Add" : "Edit"} Service</DialogTitle>
                        <DialogDescription>{mode === "add" ? addDesc : editDesc}</DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="service-name">Service Name</Label>
                                <Input name="name" defaultValue={mode === "edit" ? data?.name : undefined} id="service-name" placeholder="e.g. Men's Haircut" />
                            </Field>
                            <Field>
                                <Label htmlFor="service-price">Price ($)</Label>
                                <Input name="price" min={0} step={0.01} defaultValue={mode === "edit" ? data?.price : undefined} id="service-price" type="number" placeholder="0.00" />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="service-duration">Duration (min)</Label>
                                <Input name="duration" defaultValue={mode === "edit" ? data?.duration : undefined} id="service-duration" type="number" placeholder="30" />
                            </Field>
                            <Field>
                                <Label htmlFor="service-category">Category</Label>
                                <Input name="category" defaultValue={mode === "edit" ? data?.category : undefined} id="service-category" placeholder="e.g. Hair" />
                            </Field>
                        </div>

                        <Field>
                            <Label htmlFor="service-thumbnail">Thumbnail Image</Label>
                            <div className="relative">
                                <Input id="service-thumbnail" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer text-transparent file:cursor-pointer file:font-semibold" />
                                <span className="pointer-events-none absolute top-1/2 left-32 -translate-y-1/2 text-sm text-zinc-500">{selectedFile ? selectedFile.name : "No file selected"}</span>
                            </div>
                            {(preview || existingThumbnailUrl) && (
                                <div className="relative aspect-video h-24 overflow-hidden rounded-xl border">
                                    <Image src={preview || existingThumbnailUrl || ""} alt="Preview" fill className="object-contain" />
                                    <Button type="button" onClick={clearImage} className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black">
                                        <Plus className="size-3 rotate-45" />
                                    </Button>
                                </div>
                            )}
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

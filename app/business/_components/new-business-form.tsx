"use client";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Plus } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface Form {
    name: HTMLInputElement | null;
    opening: HTMLInputElement | null;
    closing: HTMLInputElement | null;
    description: HTMLTextAreaElement | null;
    location: HTMLInputElement | null;
    phone: HTMLInputElement | null;
}

export default function NewBusinessForm() {
    const formRef = useRef<Form>({ name: null, opening: null, closing: null, description: null, location: null, phone: null });
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        // Cleanup URL objects when component unmounts or files change
        return () => previews.forEach((url) => URL.revokeObjectURL(url));
    }, [previews]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newlySelectedFiles = Array.from(e.target.files || []);

        // 1. Update the actual File objects (append to existing)
        setBannerFiles((prev) => [...prev, ...newlySelectedFiles]);

        // 2. Generate and update preview URLs
        const newPreviews = newlySelectedFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);

        // 3. Reset the input value so the same file can be picked again if deleted
        e.target.value = "";
    };

    return (
        <form className="space-y-10">
            <div className="space-y-6">
                <div className="mb-4 flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-black" />
                    <h3 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">General Information</h3>
                </div>

                <FieldGroup className="gap-6">
                    <Field className="gap-0">
                        <Label htmlFor="biz-name">Business Name</Label>
                        <Input
                            ref={(el) => {
                                formRef.current.name = el as HTMLInputElement;
                            }}
                            required
                            id="biz-name"
                            placeholder="e.g. The Silver Scissors"
                            className="h-12 rounded-xl"
                        />
                    </Field>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field className="gap-0">
                            <Label htmlFor="biz-location">Address / Location</Label>
                            <Input
                                ref={(el) => {
                                    formRef.current.location = el as HTMLInputElement;
                                }}
                                required
                                id="biz-location"
                                placeholder="123 Business Ave, Suite 100"
                                className="h-12 rounded-xl"
                            />
                        </Field>
                        <Field className="gap-0">
                            <Label htmlFor="biz-phone">Phone Number</Label>
                            <Input
                                ref={(el) => {
                                    formRef.current.phone = el as HTMLInputElement;
                                }}
                                required
                                id="biz-phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                className="h-12 rounded-xl"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field className="gap-0">
                            <Label>Daily Operating Hours</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    ref={(el) => {
                                        formRef.current.opening = el as HTMLInputElement;
                                    }}
                                    required
                                    type="time"
                                    className="h-12 rounded-xl px-3"
                                    defaultValue="09:00"
                                />
                                <span className="text-sm font-medium text-zinc-400">to</span>
                                <Input
                                    ref={(el) => {
                                        formRef.current.closing = el as HTMLInputElement;
                                    }}
                                    required
                                    type="time"
                                    className="h-12 rounded-xl px-3"
                                    defaultValue="17:00"
                                />
                            </div>
                        </Field>
                        <Field className="gap-3">
                            <Label>Closed Days</Label>
                            <DaysDropdown />
                        </Field>
                    </div>
                    <Field className="gap-0">
                        <Label className="mb-2">Business Timezone</Label>
                        <TimezoneComboBox />
                    </Field>
                </FieldGroup>
            </div>

            <div className="space-y-6">
                <div className="mb-4 flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-black" />
                    <h3 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">Branding</h3>
                </div>

                <FieldGroup className="gap-6">
                    <Field>
                        <Label htmlFor="biz-about">Short Description</Label>
                        <Textarea
                            id="biz-about"
                            ref={(el) => {
                                formRef.current.description = el as HTMLTextAreaElement;
                            }}
                            required
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-25 w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe your business mission and vibe..."
                        />
                    </Field>

                    <Field>
                        <Label>Storefront Banner</Label>
                        {/* Preview Grid */}
                        {previews.length > 0 && (
                            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                                {previews.map((url, i) => (
                                    <div key={i} className="relative aspect-video overflow-hidden rounded-xl border">
                                        <Image src={url} alt="Preview" width={1080} height={400} className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreviews((prev) => prev.filter((_, index) => index !== i));
                                                setBannerFiles((prev) => prev.filter((_, index) => index !== i));
                                            }}
                                            className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black"
                                        >
                                            <Plus className="size-3 rotate-45" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="group relative flex min-h-40 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 transition-all hover:border-zinc-400 hover:bg-zinc-100">
                            <Label className="flex h-full w-full items-center justify-center" htmlFor="biz-banner">
                                <div className="text-center">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
                                        <Plus className="size-5 text-zinc-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-700">{bannerFiles.length > 0 ? `${bannerFiles.length} files selected` : "Upload Banner Images"}</p>
                                    <p className="text-xs text-zinc-500">PNG, JPG up to 10MB</p>
                                </div>
                                <Input multiple type="file" id="biz-banner" accept="image/*" onChange={handleFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
                            </Label>
                        </div>
                    </Field>
                </FieldGroup>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse items-center justify-end gap-4 border-t pt-8 sm:flex-row">
                <Button variant="outline" type="button" className="h-12 w-full rounded-full px-10 font-semibold sm:w-auto">
                    Discard
                </Button>
                <Button type="submit" className="h-12 w-full rounded-full bg-black px-12 font-bold text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 sm:w-auto">
                    Register Business
                </Button>
            </div>
        </form>
    );
}

function TimezoneComboBox() {
    const timezones = useMemo(
        () =>
            Intl.supportedValuesOf("timeZone").map((tz) => ({
                label: tz.replace(/_/g, " "),
                value: tz,
            })),
        [],
    );

    return (
        <Combobox items={timezones}>
            <div className="relative">
                <Globe className="absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-zinc-400" />
                <ComboboxInput placeholder="Search timezone..." className="h-10 rounded-xl pl-10" />
            </div>
            <ComboboxContent>
                <ComboboxEmpty>No timezone found.</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item.value} value={item.value}>
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

function DaysDropdown() {
    const [days, setDays] = React.useState<Record<string, boolean>>({ Sunday: false, Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* <Button variant="outline">Select Days</Button> */}
                <Button variant="outline" className="justify-start rounded-xl font-normal">
                    {Object.values(days).filter(Boolean).length > 0
                        ? Object.entries(days)
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              .filter(([_, v]) => v)
                              .map(([d]) => d.substring(0, 3))
                              .join(", ")
                        : "Select closed days"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    {Object.keys(days).map((day) => (
                        <DropdownMenuCheckboxItem key={day} checked={days[day]} onCheckedChange={(checked) => setDays({ ...days, [day]: checked === true })}>
                            {day}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

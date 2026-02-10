"use client";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Plus } from "lucide-react";
import { Dispatch, SetStateAction, SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import createBusiness from "../_actions/create-business";
import { useRouter } from "next/navigation";

type BusinessHours = {
    open: string;
    close: string;
} | null;

type WeeklySchedule = Record<string, BusinessHours>;

export default function NewBusinessForm() {
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const [timeZone, setTimeZone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [days, setDays] = useState<Record<string, boolean>>({ Sunday: false, Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: true });

    useEffect(() => {
        return () => previews.forEach((url) => URL.revokeObjectURL(url));
    }, [previews]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newlySelectedFiles = Array.from(e.target.files || []);

        setBannerFiles((prev) => [...prev, ...newlySelectedFiles]);

        const newPreviews = newlySelectedFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);

        e.target.value = "";
    };

    const handleDiscard = () => {
        if (formRef.current) resetForm(formRef.current);
        toast.info("Form cleared");
    };

    const resetForm = (formElement: HTMLFormElement) => {
        formElement.reset();

        setBannerFiles([]);
        setPreviews([]);
        setDays({ Sunday: false, Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: true });
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    };

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loading) return;

        const form = e.currentTarget;
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const supabase = createClient();

        const hours = Object.entries(days).reduce<WeeklySchedule>((acc, [day, status]) => {
            const times = formData.getAll(day);
            const [openingTime, closingTime] = times.map((t) => String(t));

            acc[day] = status && openingTime && closingTime ? { open: openingTime, close: closingTime } : null;

            return acc;
        }, {});

        const registerProcess = async () => {
            const publicUrls: string[] = [];
            const uploadedPaths: string[] = [];

            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));

                for (const file of bannerFiles) {
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${file.name.split(".")[0]}-${Date.now()}.${fileExt}`;
                    const filePath = `business/${fileName}`;

                    const { error: uploadError } = await supabase.storage.from("banners").upload(filePath, file);

                    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

                    uploadedPaths.push(filePath);

                    const { data } = supabase.storage.from("banners").getPublicUrl(filePath);

                    publicUrls.push(data.publicUrl);
                }

                const data = {
                    hours,
                    bannerImages: publicUrls,
                    name: String(formData.get("name") || ""),
                    phone: String(formData.get("phone") || ""),
                    timeZone,
                    location: String(formData.get("location") || ""),
                    description: String(formData.get("description") || ""),
                };

                const result = await createBusiness(data);

                if (result && "error" in result) throw new Error(result.message);

                return result;
            } catch (error) {
                if (uploadedPaths.length > 0) await supabase.storage.from("banners").remove(uploadedPaths);

                throw error;
            }
        };

        await toast.promise(registerProcess(), {
            loading: "Registering Business and uploading images...",
            success: (data) => {
                resetForm(form);

                router.push(`/business/my-businesses/${data.id}`);
                return `Successfully registered ${data.name}!`;
            },
            error: (err) => err.message || "Failed to register business.",
            finally: () => setLoading(false),
        });
    }

    return (
        <form className="space-y-10" ref={formRef} onSubmit={handleSubmit}>
            <div className="space-y-6">
                <div className="mb-4 flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-black" />
                    <h3 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">General Information</h3>
                </div>

                <FieldGroup className="gap-6">
                    <Field className="gap-2">
                        <Label htmlFor="biz-name">Business Name</Label>
                        <Input required id="biz-name" name="name" placeholder="e.g. The Silver Scissors" className="h-12 rounded-xl" />
                    </Field>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Field className="gap-2">
                            <Label htmlFor="biz-location">Address / Location</Label>
                            <Input required id="biz-location" name="location" placeholder="123 Business Ave, Suite 100" className="h-12 rounded-xl" />
                        </Field>
                        <Field className="gap-2">
                            <Label htmlFor="biz-phone">Phone Number</Label>
                            <Input required id="biz-phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" className="h-12 rounded-xl" />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                        <Field className="gap-2">
                            <Label>Daily Operating Hours</Label>
                            <HourSelection days={days} setDays={setDays} />
                        </Field>
                    </div>
                    <Field className="gap-0">
                        <Label className="mb-2">Business Timezone</Label>
                        <TimezoneComboBox timeZone={timeZone} setTimeZone={setTimeZone} />
                    </Field>
                </FieldGroup>
            </div>

            {/* Branding */}
            <div className="space-y-6">
                <div className="mb-4 flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-black" />
                    <h3 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">Branding</h3>
                </div>

                <FieldGroup>
                    <Field>
                        <Label htmlFor="biz-description">Short Description</Label>
                        <Textarea id="biz-description" name="description" required placeholder="Describe your business mission and vibe..." />
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
                                    <p className="my-1 text-xs text-zinc-500">Use horizontal (landscape) images for the best look.</p>
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
                <Button disabled={loading} onClick={handleDiscard} variant="outline" type="button" className="h-12 w-full rounded-full px-12 font-semibold sm:w-auto">
                    Discard
                </Button>
                <Button disabled={loading} type="submit" className="h-12 w-full rounded-full bg-black px-12 font-bold text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 sm:w-auto">
                    {loading ? "Registering…" : "Register Business"}
                </Button>
            </div>
        </form>
    );
}

interface TimeZoneProp {
    timeZone: string;
    setTimeZone: Dispatch<SetStateAction<string>>;
}

function TimezoneComboBox({ timeZone, setTimeZone }: TimeZoneProp) {
    const timezones = useMemo(() => Intl.supportedValuesOf("timeZone").map((tz) => ({ label: tz.replace(/_/g, " "), value: tz })), []);

    return (
        <Combobox items={timezones} value={timeZone} onValueChange={(value) => value && setTimeZone(value as string)}>
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

interface HourProp {
    days: Record<string, boolean>;
    setDays: Dispatch<SetStateAction<Record<string, boolean>>>;
}

function HourSelection({ days, setDays }: HourProp) {
    const toggleDay = (day: string, value: string) => {
        setDays((prev) => ({ ...prev, [day]: value === "open" }));
    };

    return (
        <Card className="px-4">
            <div className="space-y-4">
                {Object.keys(days).map((day) => (
                    <div className="flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-0" key={day}>
                        <p className="w-24 text-sm font-semibold">{day}</p>

                        <div className="flex flex-col gap-1 sm:flex-1 sm:flex-row sm:items-center sm:justify-end">
                            {!days[day] && (
                                <div className="my-1 sm:flex-1 sm:text-center">
                                    <h2 className="text-sm font-semibold">Closed all day</h2>
                                </div>
                            )}
                            {days[day] && (
                                <div className="flex items-center gap-2 transition-opacity duration-200">
                                    <Input required={days[day]} type="time" name={day} className="h-7 rounded-xl text-sm" defaultValue="09:00" />
                                    <span className="text-xs font-bold text-zinc-400 uppercase">to</span>
                                    <Input required={days[day]} type="time" name={day} className="h-7 rounded-xl text-sm" defaultValue="17:00" />
                                </div>
                            )}

                            <RadioGroup className="flex w-fit rounded-full bg-zinc-100 p-1" onValueChange={(val) => toggleDay(day, val)} value={days[day] ? "open" : "close"}>
                                <div className="flex items-center">
                                    <RadioGroupItem value="open" id={`${day}-open`} className="peer sr-only" />
                                    <Label htmlFor={`${day}-open`} className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm">
                                        Open
                                    </Label>
                                </div>
                                <div className="flex items-center">
                                    <RadioGroupItem value="close" id={`${day}-close`} className="peer sr-only" />
                                    <Label htmlFor={`${day}-close`} className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm">
                                        Closed
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

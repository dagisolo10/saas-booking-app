"use client";
import { useState, useMemo, SyntheticEvent, Dispatch, SetStateAction, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Plus, Loader2, Save, X, Clock, Info, LayoutDashboard } from "lucide-react";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import updateBusiness from "../my-businesses/[id]/_actions/update-business";
import { Business } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type BusinessHours = {
    open: string;
    close: string;
} | null;

type WeeklySchedule = Record<string, BusinessHours>;

export default function UpdateBusinessForm({ initialData }: { initialData: Business }) {
    const [bannerFiles, setBannerFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(initialData.bannerImages || []);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [imagesToRemoveFromBucket, setImagesToRemoveFromBucket] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const generalRef = useRef<HTMLDivElement>(null);
    const scheduleRef = useRef<HTMLDivElement>(null);
    const brandingRef = useRef<HTMLDivElement>(null);

    const [activeSection, setActiveSection] = useState<string>("general");

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "-40% 0px -60% 0px",
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActiveSection(entry.target.id);
            });
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        const sections = [generalRef, scheduleRef, brandingRef];

        sections.forEach((ref) => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => window.scrollTo(0, 0), []);
    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const [timeZone, setTimeZone] = useState(initialData.timeZone || "UTC");

    const [days, setDays] = useState<Record<string, boolean>>(() => {
        const schedule = (initialData.hours as Record<string, boolean>) || {};
        const base = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return base.reduce((acc, day) => ({ ...acc, [day]: !!schedule[day] }), {});
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newlySelectedFiles = Array.from(e.target.files || []);
        setBannerFiles((prev) => [...prev, ...newlySelectedFiles]);
        const previews = newlySelectedFiles.map((file) => URL.createObjectURL(file));
        setNewPreviews((prev) => [...prev, ...previews]);
        e.target.value = "";
    };

    const removeExistingImage = (url: string) => {
        setExistingImages((prev) => prev.filter((ext) => ext !== url));
        setImagesToRemoveFromBucket((prev) => {
            if (prev.includes(url)) return prev;
            return [...prev, url];
        });
    };

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const supabase = createClient();

        const hours = Object.entries(days).reduce<WeeklySchedule>((acc, [day, status]) => {
            const times = formData.getAll(day);
            const [open, close] = times.map((t) => String(t));
            acc[day] = status && open && close ? { open, close } : null;
            return acc;
        }, {});

        const processUpdate = async () => {
            const finalBannerImages = [...existingImages];

            for (const file of bannerFiles) {
                const fileName = `business/${file.name}-${Date.now()}`;
                const { error } = await supabase.storage.from("banners").upload(fileName, file);

                if (error) throw error.message;

                const { data } = supabase.storage.from("banners").getPublicUrl(fileName);

                finalBannerImages.push(data.publicUrl);
            }

            const data = {
                name: String(formData.get("name") || ""),
                phone: String(formData.get("phone") || ""),
                location: String(formData.get("location") || ""),
                description: String(formData.get("description") || ""),
                hours,
                timeZone,
                bannerImages: finalBannerImages,
                businessId: initialData.id,
            };

            const result = await updateBusiness(data);

            if ("error" in result) throw new Error(result.message);

            if (imagesToRemoveFromBucket.length > 0) {
                const paths = imagesToRemoveFromBucket
                    .map((url) => {
                        try {
                            const decodedUrl = decodeURIComponent(url);
                            const parts = decodedUrl.split("/banners/");
                            const path = parts[parts.length - 1];

                            return path.startsWith("/") ? path.substring(1) : path;
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean) as string[];

                const { error: storageError } = await supabase.storage.from("banners").remove(paths);

                if (storageError) throw new Error(storageError.message);
            }

            return result;
        };

        await toast.promise(processUpdate(), {
            loading: "Updating business...",
            success: () => {
                router.push(`/business/my-businesses/${initialData.id}`);
                return "Successfully updated!";
            },
            error: (err) => err.message || "Failed to update business",
            finally: () => setLoading(false),
        });
    }

    return (
        <main className="min-h-screen bg-[#fafafa]">
            {/* Top Bar */}
            <div className="border-b bg-white px-6 py-4">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Link href="/business/my-businesses" className="hover:text-black">
                            Businesses
                        </Link>
                        <ChevronRight className="size-4" />
                        <Link href={`/business/my-businesses/${initialData.id}`} className="hover:text-black">
                            {initialData.name}
                        </Link>
                        <ChevronRight className="size-4" />
                        <span className="font-medium text-black">Settings</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 py-12">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[200px_1fr]">
                    <aside className="hidden lg:block">
                        <nav className="sticky top-24 space-y-1">
                            {[
                                { ref: generalRef, section: "general", label: "General", icon: <Info className="size-4" /> },
                                { ref: scheduleRef, section: "schedule", label: "Schedule", icon: <Clock className="size-4" /> },
                                { ref: brandingRef, section: "branding", label: "Branding", icon: <LayoutDashboard className="size-4" /> },
                            ].map((button) => (
                                <button
                                    key={button.section}
                                    onClick={() => scrollToSection(button.ref)}
                                    className={`${activeSection === button.section ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-900"} relative flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors`}
                                >
                                    {activeSection === button.section && <motion.div layoutId="active-pill" className="absolute inset-0 -z-1 rounded-full bg-black" transition={{ type: "spring", bounce: 0.3, duration: 0.6 }} />}
                                    {button.icon} {button.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <section className="space-y-12">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
                            <p className="text-muted-foreground">Update your business identity and availability.</p>
                        </div>

                        <form className="space-y-10" onSubmit={handleSubmit}>
                            <div ref={generalRef} id="general" className="scroll-mt-24 space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-1 rounded-full bg-black" />
                                    <h3 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">General Information</h3>
                                </div>

                                <FieldGroup className="gap-6">
                                    <Field className="gap-2">
                                        <Label>Business Name</Label>
                                        <Input name="name" defaultValue={initialData.name} className="h-12 rounded-xl" required />
                                    </Field>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <Field className="gap-2">
                                            <Label>Location</Label>
                                            <Input name="location" defaultValue={initialData.location ?? ""} className="h-12 rounded-xl" required />
                                        </Field>
                                        <Field className="gap-2">
                                            <Label>Phone</Label>
                                            <Input name="phone" defaultValue={initialData.phone ?? ""} className="h-12 rounded-xl" required />
                                        </Field>
                                    </div>
                                </FieldGroup>
                            </div>

                            <div ref={scheduleRef} id="schedule" className="scroll-mt-24 space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-1 rounded-full bg-black" />
                                    <h3 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">Schedule</h3>
                                </div>
                                <FieldGroup>
                                    <Field className="gap-2">
                                        <Label>Operating Hours</Label>
                                        <HourSelection days={days} setDays={setDays} initialHours={initialData.hours} />
                                    </Field>

                                    <Field className="gap-2">
                                        <Label>Timezone</Label>
                                        <TimezoneComboBox timeZone={timeZone} setTimeZone={setTimeZone} />
                                    </Field>
                                </FieldGroup>
                            </div>

                            <div ref={brandingRef} id="branding" className="scroll-mt-24 space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-1 rounded-full bg-black" />
                                    <h3 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">Branding</h3>
                                </div>

                                <FieldGroup>
                                    <Field>
                                        <Label>Description</Label>
                                        <Textarea name="description" defaultValue={initialData.description ?? ""} required rows={4} />
                                    </Field>

                                    <Field>
                                        <Label>Storefront Banner Images</Label>
                                        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                                            {/* Render Existing Images */}
                                            {existingImages.map((url, i) => (
                                                <div key={`existing-${i}`} className="relative aspect-video overflow-hidden rounded-xl border">
                                                    <Image src={url} alt="Current" fill className="object-cover" />
                                                    <button type="button" onClick={() => removeExistingImage(url)} className="bg-destructive absolute top-1 right-1 rounded-full p-1 text-white shadow-lg">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {/* Render New Previews */}
                                            {newPreviews.map((url, i) => (
                                                <div key={`new-${i}`} className="border-primary/50 relative aspect-video overflow-hidden rounded-xl border">
                                                    <Image src={url} alt="New" fill className="object-cover" />
                                                    <div className="bg-primary absolute top-1 left-1 rounded px-1.5 text-[10px] text-white">NEW</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="group relative flex min-h-32 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 transition-all hover:bg-zinc-100">
                                            <Label className="flex h-full w-full items-center justify-center" htmlFor="biz-banner">
                                                <div className="text-center">
                                                    <Plus className="mx-auto mb-1 size-5 text-zinc-400" />
                                                    <p className="text-xs font-semibold text-zinc-700">Add more images</p>
                                                </div>
                                                <Input multiple type="file" id="biz-banner" accept="image/*" onChange={handleFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
                                            </Label>
                                        </div>
                                    </Field>
                                </FieldGroup>
                            </div>

                            <div className="flex flex-row items-center justify-end gap-4">
                                <Button onClick={() => router.back()} disabled={loading} variant="outline" type="button" className="h-12 rounded-full px-12 font-semibold sm:w-auto">
                                    Discard
                                </Button>
                                <Button disabled={loading} type="submit" className="h-12 rounded-full bg-black font-bold text-white shadow-2xl transition-all hover:bg-zinc-800 active:scale-95 sm:w-auto">
                                    {loading ? <Loader2 className="mr-1 animate-spin" /> : <Save className="mr-1 size-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 bg-red-50/50 p-6">
                <h3 className="text-sm font-bold tracking-widest text-red-900 uppercase">Danger Zone</h3>
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-red-900">Close Business Temporarily</p>
                        <p className="text-xs text-red-700">Hide your shop from customers. You can re-open anytime.</p>
                    </div>
                    <Button variant="outline" className="border-red-200 text-red-900 hover:bg-red-100">
                        Pause Business
                    </Button>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-red-100 pt-6">
                    <div>
                        <p className="font-bold text-red-900">Delete Permanently</p>
                        <p className="text-xs text-red-700">This will delete all services, images, and history. This cannot be undone.</p>
                    </div>
                    <Button variant="destructive">Delete Business</Button>
                </div>
            </div>
        </main>
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
                <ComboboxInput placeholder={timeZone ? timeZone.replace(/_/g, " ") : "Select timezone..."} className="h-10 rounded-xl pl-10" />
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
    initialHours: JsonValue;
}

function HourSelection({ days, setDays, initialHours }: HourProp) {
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
                                    <Input required={days[day]} type="time" name={day} className="h-7 rounded-xl text-sm" defaultValue={(initialHours as WeeklySchedule)?.[day]?.open || "09:00"} />
                                    <span className="text-xs font-bold text-zinc-400 uppercase">to</span>
                                    <Input required={days[day]} type="time" name={day} className="h-7 rounded-xl text-sm" defaultValue={(initialHours as WeeklySchedule)?.[day]?.close || "17:00"} />
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

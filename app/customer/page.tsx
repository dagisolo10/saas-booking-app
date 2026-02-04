"use client";
import { Scissors, Sparkles, Flower2, Dumbbell, Heart, Calendar, Search } from "lucide-react";
import Link from "next/link";

export default function Customer() {
    return (
        <main className="bg-background text-foreground mx-auto min-h-screen">
            <section className="relative overflow-hidden py-12 text-center">
                <div className="container mx-auto max-w-5xl px-4">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-sm text-zinc-600 shadow-sm backdrop-blur">
                        <Sparkles className="size-4 text-yellow-500" />
                        <span>Over 2,500+ local experts joined this month</span>
                    </div>

                    <h1 className="mb-6 text-5xl leading-tight font-extrabold tracking-tight md:text-7xl">
                        Book trusted local <span className="text-primary">services</span> in seconds.
                    </h1>

                    <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg md:text-xl">Discover salons, spas, gyms, and wellness experts near you. Book instantly, no phone calls required.</p>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-12">
                <div className="container mx-auto max-w-6xl px-4 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight">How it works</h2>
                    <p className="text-muted-foreground mx-auto mb-12 max-w-2xl">Finding and booking your next appointment has never been easier.</p>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <StepCard icon={<Search />} title="1. Find a Service" text="Browse trusted local businesses or search for the exact service you need." />
                        <StepCard icon={<Calendar />} title="2. Pick a Time" text="View real-time availability and choose a slot that fits your schedule." />
                        <StepCard icon={<Heart />} title="3. Book & Relax" text="Confirm instantly and show up. No calls, no waiting — just results." />
                    </div>
                </div>
            </section>

            {/* --- FEATURED CATEGORIES --- */}
            <section className="py-16">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Browse by category</h2>
                            <p className="text-muted-foreground">Find exactly what you need for your self-care routine.</p>
                        </div>
                        <button className="text-primary text-sm font-semibold hover:underline">View all</button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <CategoryCard icon={<Scissors />} name="Barber Shop" count="120+ Pros" color="bg-blue-50 text-blue-600 border-blue-100" />
                        <CategoryCard icon={<Flower2 />} name="Wellness" count="85+ Studios" color="bg-green-50 text-green-600 border-green-100" />
                        <CategoryCard icon={<Sparkles />} name="Aesthetics" count="200+ Experts" color="bg-purple-50 text-purple-600 border-purple-100" />
                        <CategoryCard icon={<Dumbbell />} name="Fitness" count="45+ Gyms" color="bg-orange-50 text-orange-600 border-orange-100" />
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-12 text-center">
                <div className="container mx-auto max-w-3xl px-4">
                    <h2 className="mb-4 text-4xl font-bold">Join thousands of happy customers.</h2>
                    <p className="text-muted-foreground mb-8 text-lg">Start exploring local services near you today — book your first appointment in seconds.</p>
                    <Link href={`/customer/services`} className="bg-primary hover:bg-primary/90 rounded-full px-8 py-3 font-semibold text-white transition-colors">
                        Get Started
                    </Link>
                </div>
            </section>

            {/* --- TRUST / TESTIMONIAL SECTION --- */}
            <section className="border-border border-y py-12 text-center">
                <div className="container mx-auto max-w-6xl px-4">
                    <p className="text-muted-foreground mb-6 text-sm font-bold tracking-widest uppercase">Trusted by top professionals</p>
                    <div className="flex flex-wrap justify-center gap-12 text-2xl font-semibold text-zinc-800 opacity-50">
                        <span>VOGUE</span>
                        <span>GQ</span>
                        <span>GLAMOUR</span>
                        <span>Cosmopolitan</span>
                    </div>
                </div>
            </section>
        </main>
    );
}

function CategoryCard({ icon, name, count, color }: { icon: React.ReactNode; name: string; count: string; color: string }) {
    return (
        <div className="bg-card border-border relative rounded-2xl border p-6 transition-all hover:shadow-lg">
            <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl border ${color}`}>{icon}</div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-muted-foreground text-sm">{count}</p>
        </div>
    );
}

function StepCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
    return (
        <div className="bg-card border-border rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md">
            <div className="bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-xl">{icon}</div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm">{text}</p>
        </div>
    );
}

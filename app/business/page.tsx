import { LayoutDashboard, Users, BarChart3, ShieldCheck, Zap, Globe, Plus } from "lucide-react";
import Link from "next/link";

export default function BusinessLanding() {
    return (
        <main className="bg-background text-foreground mx-auto min-h-screen pt-4">
            {/* --- HERO SECTION --- */}
            <section className="mx-auto max-w-5xl text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-xs text-zinc-600 shadow-sm backdrop-blur sm:text-sm">
                    <Zap className="size-4 fill-blue-500 text-blue-500" />
                    <span>Empowering 500+ local businesses this month</span>
                </div>

                <h1 className="mb-6 text-5xl leading-tight font-extrabold tracking-tight md:text-7xl">
                    Grow your business on <span className="text-primary">autopilot.</span>
                </h1>

                <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg">The all-in-one platform to manage bookings, track revenue, and reach new customers. Stop chasing appointments and start building your brand.</p>

                <div className="flex justify-center gap-4">
                    <Link href="/business/my-businesses" className="bg-primary hover:bg-primary/90 rounded-full px-8 py-3 font-semibold text-white transition-colors">
                        List Your Businesses
                    </Link>
                </div>
            </section>

            {/* --- CORE FEATURES / HOW IT HELPS --- */}
            <section className="mx-auto max-w-6xl px-4 py-16 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight">Everything you need to scale</h2>
                <p className="text-muted-foreground mx-auto mb-12 max-w-2xl">Powerful tools designed specifically for service-based professionals.</p>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <FeatureCard icon={<LayoutDashboard />} title="Smart Dashboard" text="Monitor your daily schedule, active bookings, and total completions at a single glance." />
                    <FeatureCard icon={<BarChart3 />} title="Revenue Tracking" text="Detailed analytics on your most popular services and monthly earnings reports." />
                    <FeatureCard icon={<Users />} title="Client Management" text="Maintain a digital database of your customers, their history, and verified reviews." />
                </div>
            </section>

            {/* --- VALUE PROPOSITION --- */}
            <section className="py-20">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        <div className="space-y-6">
                            <h2 className="text-4xl leading-tight font-bold">
                                Your business is open <br /> 24/7—even when you are not.
                            </h2>
                            <p className="text-muted-foreground">Let your customers book appointments while you sleep. Our automated system handles scheduling, cancellations, and notifications so you can focus on your craft.</p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 font-medium">
                                    <ShieldCheck className="text-green-500" /> Secure payment processing
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <Globe className="text-blue-500" /> Custom business landing page
                                </li>
                                <li className="flex items-center gap-3 font-medium">
                                    <Plus className="text-primary" /> Unlimited service listings
                                </li>
                            </ul>
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-2xl border-8 border-zinc-800 bg-zinc-900 shadow-2xl">
                            {/* Mockup of the dashboard you'll build */}
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500 italic"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING CTA --- */}
            <section className="bg-primary text-primary-foreground py-16">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="mb-6 text-4xl font-bold">Ready to take the next step?</h2>
                    <p className="mb-10 text-xl opacity-90">Join the thousands of professionals who have simplified their workflow and increased their revenue.</p>
                    <Link href="/business/onboarding" className="text-primary rounded-full bg-white px-10 py-4 font-bold transition-colors hover:bg-zinc-100">
                        Get Started for Free
                    </Link>
                    <p className="mt-6 text-sm opacity-75">No credit card required to start.</p>
                </div>
            </section>
        </main>
    );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
    return (
        <div className="bg-card rounded-2xl border p-8 text-left shadow-sm transition-all hover:shadow-md">
            <div className="bg-primary/10 text-primary mb-6 inline-flex size-14 items-center justify-center rounded-2xl">{icon}</div>
            <h3 className="mb-2 text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{text}</p>
        </div>
    );
}

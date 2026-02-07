import { Store, CheckCircle2, ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";
import NewBusinessForm from "../_components/new-business-form";

export default function CreateBusiness() {
    return (
        <main className="bg-background flex min-h-screen flex-col lg:flex-row">
            {/* LEFT SIDE: Branding & Info (Visible on Large Screens) */}
            <section className="relative hidden flex-col justify-between bg-zinc-900 p-12 text-white lg:flex lg:w-2/5">
                <div>
                    <Link href="/business/my-businesses" className="mb-8 flex items-center gap-2 text-zinc-400 transition-colors hover:text-white">
                        <ArrowLeft className="size-4" />
                        <span className="text-sm font-medium">Back to dashboard</span>
                    </Link>

                    <div className="space-y-6">
                        <div className="w-fit rounded-2xl bg-white/10 p-3">
                            <Store className="size-8 text-white" />
                        </div>
                        <h1 className="text-5xl leading-tight font-extrabold tracking-tighter">
                            Bring your business <br /> to the digital front.
                        </h1>
                        <p className="max-w-md text-lg text-zinc-400">Join thousands of professionals. List your services, manage bookings, and grow your brand in one place.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-white/5">
                            <CheckCircle2 className="size-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Professional Profile</p>
                            <p className="text-xs text-zinc-500">A dedicated page for your business.</p>
                        </div>
                    </div>
                    <div className="items-c enter flex gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-white/5">
                            <CheckCircle2 className="size-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Smart Scheduling</p>
                            <p className="text-xs text-zinc-500">Automate your client appointments.</p>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Element */}
                <div className="pointer-events-none absolute right-0 bottom-0 h-1/2 w-full bg-linear-to-t from-white/5 to-transparent" />
            </section>

            {/* RIGHT SIDE: The Form Area */}
            <section className="flex flex-1 flex-col overflow-y-auto px-6 py-6 lg:px-20 lg:py-12">
                <div className="mx-auto w-full max-w-xl">
                    {/* Mobile Header (Only visible on small screens) */}
                    <div className="mb-8 lg:hidden">
                        <div className="text-primary mb-4 flex items-center gap-2">
                            <Rocket className="size-6" />
                            <span className="font-bold tracking-tight">Partner Portal</span>
                        </div>
                        <h1 className="text-3xl font-extrabold">Register Business</h1>
                    </div>
                    <header className="mb-8 space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Business Details</h2>
                        <p className="text-muted-foreground">Please provide the information below to register your business. You can edit these details later in your settings.</p>
                    </header>
                    {/* Form */}
                    <NewBusinessForm />
                    <footer className="mt-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            By registering, you agree to our <span className="cursor-pointer underline">Terms of Service</span>.
                        </p>
                    </footer>
                </div>
            </section>
        </main>
    );
}

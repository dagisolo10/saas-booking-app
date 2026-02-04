// import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//     const { searchParams, origin } = new URL(request.url);
//     const code = searchParams.get("code");
//     const next = searchParams.get("next") ?? "/onboard";

//     if (code) {
//         const supabase = await createClient();
//         const { error } = await supabase.auth.exchangeCodeForSession(code);

//         if (error) {
//             console.error("EXCHANGE ERROR:", error.message); // Look at your terminal/CMD
//             return NextResponse.redirect(`${origin}/sign-in?error=${error.message}`);
//         }

//         return NextResponse.redirect(`${origin}${next}`);
//     }

//     // If something goes wrong, send them to an error page or sign-in
//     return NextResponse.redirect(`${origin}/auth/auth-error`);
// }
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/onboard";

    if (code) {
        const cookieStore = await cookies(); // Await if on Next.js 15
        const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    } catch {
                        /* This can be ignored if called from middleware */
                    }
                },
            },
        });

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/sign-in?error=auth-code-error`);
}
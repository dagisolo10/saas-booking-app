"use client";
import { createClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 2. Listen for changes (Login, Logout, Token Refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth Event:", event);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Optional: Refresh the page data if a user signs out
            if (event === "SIGNED_OUT") router.refresh();
        });

        // 3. Cleanup the listener when the component unmounts
        return () => {
            subscription.unsubscribe();
        };
    }, [router, supabase.auth]);

   async function signOut() {
       await supabase.auth.signOut();
       setUser(null); // Manually clear state for instant UI update
       setSession(null);
       router.push("/");
       router.refresh(); // Clears any server-side data cached in the browser
   }

    const value = { user, session, loading, signOut };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) throw new Error("useAuth must be use within AuthProvider");

    return context;
}

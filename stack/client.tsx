// client.ts
import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
    tokenStore: "nextjs-cookie",
    urls: {
        afterSignUp: "/onboard",
        afterSignIn: "/onboard",
        afterSignOut: "/",
    },
});

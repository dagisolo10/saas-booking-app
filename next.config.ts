import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "jcqmhvsjaemggmrcsyic.supabase.co",
                // hostname: `${process.env.SUPABASE_ID}.supabase.co`,
                port: "",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

export default nextConfig;

import type { MetadataRoute } from "next";

const FALLBACK_SITE_URL = "https://goaltrivia.com";

function getSiteUrl() {
    const fromEnv = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!fromEnv) return FALLBACK_SITE_URL;
    return fromEnv.replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl();

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/quiz/", "/leaderboard", "/about"],
                disallow: [
                    "/api/",
                    "/admin/",
                    "/admin",
                    "/_next/",
                    "/profile",
                ],
            },
            {
                userAgent: "Googlebot",
                allow: ["/", "/quiz/", "/leaderboard", "/about"],
                disallow: ["/api/", "/admin/", "/profile"],
            },
            {
                userAgent: "Bingbot",
                allow: ["/", "/quiz/", "/leaderboard", "/about"],
                disallow: ["/api/", "/admin/", "/profile"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}

import type { MetadataRoute } from "next";

import quizzes from "@/data/quizzes.json";

const FALLBACK_SITE_URL = "https://goaltrivia.com";

function getSiteUrl() {
    const fromEnv = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!fromEnv) return FALLBACK_SITE_URL;
    return fromEnv.replace(/\/+$/, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = getSiteUrl();
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
        { url: `${siteUrl}/quiz`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
        { url: `${siteUrl}/leaderboard`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
        { url: `${siteUrl}/profile`, lastModified: now, changeFrequency: "weekly", priority: 0.4 },
        { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
        { url: `${siteUrl}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
        { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ];

    const list = quizzes as unknown as Array<{ slug: string }>;
    const quizRoutes: MetadataRoute.Sitemap = list
        .map((q) => (typeof q?.slug === "string" ? q.slug.trim() : ""))
        .filter(Boolean)
        .flatMap((slug) => {
            return [
                {
                    url: `${siteUrl}/quiz/${slug}`,
                    lastModified: now,
                    changeFrequency: "weekly",
                    priority: 0.8,
                },
                {
                    url: `${siteUrl}/quiz/${slug}/play`,
                    lastModified: now,
                    changeFrequency: "weekly",
                    priority: 0.6,
                },
            ];
        });

    return [...staticRoutes, ...quizRoutes];
}

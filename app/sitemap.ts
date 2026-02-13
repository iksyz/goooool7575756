import type { MetadataRoute } from "next";

import quizzes from "@/data/quizzes.json";

const FALLBACK_SITE_URL = "https://goaltrivia.com";

function getSiteUrl() {
    const fromEnv = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!fromEnv) return FALLBACK_SITE_URL;
    return fromEnv.replace(/\/+$/, "");
}

export const dynamic = "force-dynamic"; // Her build'de yeniden oluştur
export const revalidate = 3600; // 1 saat cache (quiz eklenince revalidate edilecek)

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = getSiteUrl();
    const now = new Date();

    // Static routes - önem sırasına göre
    const staticRoutes: MetadataRoute.Sitemap = [
        { 
            url: `${siteUrl}/`, 
            lastModified: now, 
            changeFrequency: "daily", 
            priority: 1.0 
        },
        { 
            url: `${siteUrl}/quiz`, 
            lastModified: now, 
            changeFrequency: "daily", 
            priority: 0.9 
        },
        { 
            url: `${siteUrl}/leaderboard`, 
            lastModified: now, 
            changeFrequency: "weekly", 
            priority: 0.6 
        },
        { 
            url: `${siteUrl}/about`, 
            lastModified: now, 
            changeFrequency: "monthly", 
            priority: 0.5 
        },
        { 
            url: `${siteUrl}/privacy-policy`, 
            lastModified: now, 
            changeFrequency: "yearly", 
            priority: 0.3 
        },
        { 
            url: `${siteUrl}/terms`, 
            lastModified: now, 
            changeFrequency: "yearly", 
            priority: 0.3 
        },
    ];

    // Quiz routes - dynamically generated
    const list = quizzes as unknown as Array<{ 
        slug: string; 
        difficulty?: string;
        league?: string;
    }>;
    
    const quizRoutes: MetadataRoute.Sitemap = list
        .map((q) => (typeof q?.slug === "string" ? q.slug.trim() : ""))
        .filter(Boolean)
        .flatMap((slug, index) => {
            const quiz = list[index];
            // Yeni eklenen quizler daha yüksek priority
            const basePriority = index < 10 ? 0.85 : 0.75;
            
            return [
                {
                    url: `${siteUrl}/quiz/${slug}`,
                    lastModified: now,
                    changeFrequency: "weekly" as const,
                    priority: basePriority,
                },
                {
                    url: `${siteUrl}/quiz/${slug}/play`,
                    lastModified: now,
                    changeFrequency: "weekly" as const,
                    priority: basePriority - 0.15,
                },
            ];
        });

    console.log(`📄 Sitemap generated: ${staticRoutes.length} static + ${quizRoutes.length} quiz routes`);

    return [...staticRoutes, ...quizRoutes];
}

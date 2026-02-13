/**
 * Sitemap Utilities
 * 
 * Quiz eklendikten sonra arama motorlarına sitemap'in güncellendiğini bildirmek için.
 */

const FALLBACK_SITE_URL = "https://goaltrivia.com";

function getSiteUrl() {
    const fromEnv = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!fromEnv) return FALLBACK_SITE_URL;
    return fromEnv.replace(/\/+$/, "");
}

/**
 * Google'a sitemap güncellendiğini bildir
 */
export async function pingGoogleSitemap(): Promise<boolean> {
    try {
        const siteUrl = getSiteUrl();
        const sitemapUrl = `${siteUrl}/sitemap.xml`;
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        
        const response = await fetch(pingUrl, {
            method: "GET",
            headers: { "User-Agent": "GoalTrivia/1.0" },
        });

        if (response.ok) {
            console.log("✅ Google sitemap ping successful");
            return true;
        } else {
            console.warn(`⚠️ Google sitemap ping failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error("❌ Google sitemap ping error:", error);
        return false;
    }
}

/**
 * Bing'e sitemap güncellendiğini bildir
 */
export async function pingBingSitemap(): Promise<boolean> {
    try {
        const siteUrl = getSiteUrl();
        const sitemapUrl = `${siteUrl}/sitemap.xml`;
        const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        
        const response = await fetch(pingUrl, {
            method: "GET",
            headers: { "User-Agent": "GoalTrivia/1.0" },
        });

        if (response.ok) {
            console.log("✅ Bing sitemap ping successful");
            return true;
        } else {
            console.warn(`⚠️ Bing sitemap ping failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error("❌ Bing sitemap ping error:", error);
        return false;
    }
}

/**
 * Tüm arama motorlarına sitemap ping gönder
 */
export async function pingAllSearchEngines(): Promise<{ google: boolean; bing: boolean }> {
    const [google, bing] = await Promise.all([
        pingGoogleSitemap(),
        pingBingSitemap(),
    ]);

    return { google, bing };
}

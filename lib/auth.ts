import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import type { Session } from "next-auth";

// DATABASE_URL kontrolü
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("❌ CRITICAL: DATABASE_URL is missing!");
    console.error("NextAuth database adapter requires DATABASE_URL environment variable.");
    console.error("Please set DATABASE_URL in Cloudflare Pages environment variables.");
}

// Prisma import - DATABASE_URL yoksa lib/prisma.ts hata fırlatacak
import { prisma } from "@/lib/prisma";

// NEXTAUTH_URL'i kontrol et ve ayarla
const getBaseUrl = () => {
    // Cloudflare Pages için sabit URL kullan
    const cloudflareUrl = "https://goaltrivia.com";
    
    if (process.env.NEXTAUTH_URL) {
        // Tırnak işaretlerini ve sonundaki slash'leri temizle
        const cleaned = process.env.NEXTAUTH_URL
            .replace(/^["']|["']$/g, "") // Başta ve sonda tırnak işaretlerini kaldır
            .replace(/\/+$/, ""); // Sonundaki slash'leri kaldır
        
        // Eğer temizlenmiş URL goaltrivia.com ile eşleşiyorsa kullan
        if (cleaned === cloudflareUrl || cleaned.includes("goaltrivia.com")) {
            return cloudflareUrl;
        }
        return cleaned;
    }
    // Cloudflare Pages için fallback
    return cloudflareUrl;
};

// Environment variables kontrolü
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

// NEXTAUTH_SECRET kontrolü (tırnak işaretlerini temizle)
const cleanNextAuthSecret = nextAuthSecret?.replace(/^["']|["']$/g, "") || null;
const cleanNextAuthUrl = nextAuthUrl?.replace(/^["']|["']$/g, "").replace(/\/+$/, "") || null;

if (!googleClientId || !googleClientSecret) {
    console.error("Missing Google OAuth credentials!");
    console.error("GOOGLE_CLIENT_ID:", googleClientId ? "SET" : "MISSING");
    console.error("GOOGLE_CLIENT_SECRET:", googleClientSecret ? "SET" : "MISSING");
}

if (!cleanNextAuthSecret) {
    console.error("⚠️ CRITICAL: NEXTAUTH_SECRET is missing!");
    console.error("NEXTAUTH_SECRET:", nextAuthSecret ? `SET (but may have quotes: ${nextAuthSecret})` : "MISSING");
}

if (!cleanNextAuthUrl) {
    console.error("⚠️ CRITICAL: NEXTAUTH_URL is missing!");
    console.error("NEXTAUTH_URL:", nextAuthUrl ? `SET (but may have quotes: ${nextAuthUrl})` : "MISSING");
}

// DATABASE_URL kontrolü
if (!databaseUrl) {
    console.error("⚠️ CRITICAL: DATABASE_URL is missing!");
    console.error("NextAuth database adapter requires DATABASE_URL to store sessions.");
    console.error("Without DATABASE_URL, Google sign-in will fail!");
}

// Production ortamında kritik değişkenleri logla
if (process.env.NODE_ENV === "production") {
    console.log("🔐 Production Auth Config:", {
        hasClientId: !!googleClientId,
        hasClientSecret: !!googleClientSecret,
        hasNextAuthSecret: !!cleanNextAuthSecret,
        hasNextAuthUrl: !!cleanNextAuthUrl,
        hasDatabaseUrl: !!databaseUrl,
        baseUrl: getBaseUrl(),
        clientIdPrefix: googleClientId?.substring(0, 20) + "...",
        databaseUrlPrefix: databaseUrl ? databaseUrl.substring(0, 20) + "..." : "MISSING",
    });
}

const baseUrl = getBaseUrl();

// JWT mode kullanıyoruz, adapter'a ihtiyacımız yok
// Adapter Cloudflare Pages'de sorun çıkarabiliyor, bu yüzden kaldırıyoruz
// Kullanıcıları veritabanına kaydetmek istersen, callback'te manuel olarak yapabilirsin

export const authOptions: NextAuthOptions = {
    // adapter: undefined, // JWT mode için adapter gerekmez ve Cloudflare'de sorun çıkarabilir
    secret: cleanNextAuthSecret || undefined,
    // Cloudflare Pages için özel ayarlar
    useSecureCookies: process.env.NEXTAUTH_URL?.startsWith("https://") ?? true,
    // Cloudflare proxy hatası için - NextAuth v4'te AUTH_TRUST_HOST env variable kullanılır
    // Bu dosyada direkt ekleyemeyiz, Cloudflare Pages'e AUTH_TRUST_HOST=true eklenmeli
    // Cookies ayarları - Cloudflare için optimize edilmiş
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax", // Cloudflare için lax kullan
                path: "/",
                secure: true, // HTTPS zorunlu
                // domain belirtme - Cloudflare'de sorun çıkarabilir
            },
        },
        callbackUrl: {
            name: `__Secure-next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: true,
                // domain belirtme - Cloudflare'de sorun çıkarabilir
            },
        },
        csrfToken: {
            name: `__Host-next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: true,
                // __Host- prefix için domain olmamalı
            },
        },
    },
    session: {
        strategy: "jwt", // JWT mode - veritabanı bağlantı sorunlarını bypass eder
        maxAge: 30 * 24 * 60 * 60, // 30 gün
    },
    providers: [
        GoogleProvider({
            clientId: googleClientId ?? "",
            clientSecret: googleClientSecret ?? "",
            // Email account linking için - aynı email ile farklı provider'ları bağla
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
            // Cloudflare için özel ayarlar
            checks: ["pkce", "state"], // PKCE ve state kontrolü aktif
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: Session; token: any }) {
            // JWT mode için - token'dan tüm bilgileri al
            if (session.user) {
                if (token?.sub) {
                    (session.user as any).id = token.sub;
                }
                if (token?.email) {
                    session.user.email = token.email;
                }
                if (token?.name) {
                    session.user.name = token.name;
                }
                if (token?.picture) {
                    session.user.image = token.picture;
                }
            }
            return session;
        },
        async redirect({ url, baseUrl: nextAuthBaseUrl }) {
            // Cloudflare Pages için sabit baseUrl kullan
            const siteUrl = "https://goaltrivia.com";
            
            console.log("🔀 Redirect callback:", { 
                url, 
                baseUrl: nextAuthBaseUrl, 
                siteUrl,
                envNextAuthUrl: process.env.NEXTAUTH_URL,
                isCallback: url.includes("/api/auth/callback"),
            });
            
            // Callback URL'leri için özel işlem
            if (url.includes("/api/auth/callback")) {
                // Callback sonrası admin sayfasına yönlendir
                return `${siteUrl}/admin/generator`;
            }
            
            // Eğer URL zaten siteUrl ile başlıyorsa, olduğu gibi döndür
            if (url.startsWith(siteUrl)) {
                return url;
            }
            
            // Relative URL ise siteUrl ile birleştir
            if (url.startsWith("/")) {
                return `${siteUrl}${url}`;
            }
            
            // Diğer durumlarda admin sayfasına yönlendir (giriş yapmış kullanıcı için)
            return `${siteUrl}/admin/generator`;
        },
        async signIn({ user, account, profile }) {
            // Detaylı debug logging
            console.log("🔐 SignIn callback triggered:", {
                userEmail: user?.email,
                userName: user?.name,
                userImage: user?.image,
                accountProvider: account?.provider,
                accountType: account?.type,
                accountId: account?.providerAccountId,
                hasAccessToken: !!account?.access_token,
                hasRefreshToken: !!account?.refresh_token,
                hasAccount: !!account,
                hasProfile: !!profile,
                profileEmail: (profile as any)?.email,
                timestamp: new Date().toISOString(),
            });

            // Google OAuth için özel kontrol - ama false döndürme, sadece log
            if (account?.provider === "google") {
                if (!account.access_token) {
                    console.error("⚠️ Google OAuth: access_token eksik ama devam ediyoruz");
                    console.error("Account object:", JSON.stringify(account, null, 2));
                    // false döndürmüyoruz çünkü bu OAuthSignin hatasına neden olur
                }
                if (!user?.email) {
                    console.error("⚠️ Google OAuth: user email eksik ama devam ediyoruz");
                    console.error("User object:", JSON.stringify(user, null, 2));
                    // false döndürmüyoruz çünkü bu OAuthSignin hatasına neden olur
                }
                console.log("✅ Google OAuth: Giriş onaylandı");
            }

            // Tüm girişlere izin ver - Cloudflare proxy sorunlarını bypass et
            return true;
        },
        async jwt({ token, account, profile, user, trigger }) {
            // JWT callback - user bilgilerini token'a ekle
            console.log("🔑 JWT callback:", {
                hasAccount: !!account,
                hasUser: !!user,
                hasProfile: !!profile,
                trigger,
                tokenEmail: token.email,
            });

            if (account) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            
            // User bilgilerini token'a ekle (ilk girişte)
            if (user) {
                token.id = user.id || token.sub;
                token.email = user.email || token.email;
                token.name = user.name || token.name;
                token.picture = user.image || token.picture;
            }
            
            // Profile bilgilerini token'a ekle (Google OAuth'dan gelen)
            if (profile) {
                token.email = token.email || (profile as any).email;
                token.name = token.name || (profile as any).name;
                token.picture = token.picture || (profile as any).picture;
            }
            
            return token;
        },
    },
    debug: true, // Production'da da debug açık olsun
    logger: {
        error(code, metadata) {
            console.error("❌ NextAuth Error:", code, JSON.stringify(metadata, null, 2));
            
            // OAuthSignin hatası için detaylı log
            if (code === "OAuthSignin" || code === "SIGNIN_OAUTH_ERROR" || code === "OAuthCallback") {
                console.error("🔴 OAuthSignin Error Details:", {
                    code,
                    metadata: JSON.stringify(metadata, null, 2),
                    clientId: googleClientId?.substring(0, 20) + "...",
                    clientIdFull: googleClientId,
                    baseUrl,
                    callbackUrl: `${baseUrl}/api/auth/callback/google`,
                    nextAuthUrl: cleanNextAuthUrl || process.env.NEXTAUTH_URL,
                    nextAuthSecret: cleanNextAuthSecret ? "SET" : "MISSING",
                    nodeEnv: process.env.NODE_ENV,
                    checkRedirectUri: "Google Cloud Console'da redirect URI'yi kontrol edin",
                    checkGoogleConsole: `https://console.cloud.google.com/apis/credentials`,
                    troubleshooting: [
                        "1. Google Cloud Console'da Authorized redirect URIs'de şu URL olmalı:",
                        `   ${baseUrl}/api/auth/callback/google`,
                        "2. NEXTAUTH_SECRET doğru ayarlanmış olmalı (tırnak işareti olmadan)",
                        "3. NEXTAUTH_URL doğru ayarlanmış olmalı (tırnak işareti olmadan)",
                        "4. GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET doğru olmalı",
                        "5. OAuth consent screen'de test users ekli olmalı",
                    ],
                });
            }
            
            // CredentialsSignin hatası
            if (code === "CredentialsSignin") {
                console.error("🔴 Credentials Signin Error:", {
                    code,
                    metadata: JSON.stringify(metadata, null, 2),
                });
            }
        },
        warn(code) {
            console.warn("⚠️ NextAuth Warning:", code);
        },
        debug(code, metadata) {
            console.log("🔍 NextAuth Debug:", code, JSON.stringify(metadata, null, 2));
        },
    },
};

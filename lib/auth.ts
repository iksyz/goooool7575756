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

// Adapter'ı sadece DATABASE_URL varsa kullan
let adapter: any = undefined;
try {
    if (databaseUrl) {
        adapter = PrismaAdapter(prisma);
        console.log("✅ PrismaAdapter initialized successfully");
    } else {
        console.error("❌ DATABASE_URL missing - PrismaAdapter cannot be initialized");
        console.error("⚠️ NextAuth will fail without database adapter!");
    }
} catch (error) {
    console.error("❌ Failed to initialize PrismaAdapter:", error);
    console.error("Check DATABASE_URL and database connection.");
}

export const authOptions: NextAuthOptions = {
    adapter: adapter, // JWT mode'da optional ama kullanıcıları veritabanına kaydetmek için kullanılır
    secret: cleanNextAuthSecret || undefined,
    // Cloudflare Pages için özel ayarlar
    useSecureCookies: process.env.NEXTAUTH_URL?.startsWith("https://") ?? true,
    // Cloudflare proxy arkasında olduğumuz için trust proxy
    trustHost: true, // Cloudflare Pages için zorunlu
    // Cookies ayarları - Cloudflare için optimize edilmiş
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax", // Cloudflare için lax kullan (strict CSRF hatası verebilir)
                path: "/",
                secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? true,
            },
        },
        callbackUrl: {
            name: `__Secure-next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? true,
            },
        },
        csrfToken: {
            name: `__Host-next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? true,
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
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: Session; token: any }) {
            // JWT mode için - token'dan user ID'yi al
            if (session.user && token?.sub) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
        async redirect({ url, baseUrl: nextAuthBaseUrl }) {
            // Cloudflare Pages için sabit baseUrl kullan
            const siteUrl = "https://goaltrivia.com";
            
            console.log("Redirect callback:", { 
                url, 
                baseUrl: nextAuthBaseUrl, 
                siteUrl,
                envNextAuthUrl: process.env.NEXTAUTH_URL 
            });
            
            // Eğer URL zaten siteUrl ile başlıyorsa, olduğu gibi döndür
            if (url.startsWith(siteUrl)) {
                return url;
            }
            
            // Relative URL ise siteUrl ile birleştir
            if (url.startsWith("/")) {
                return `${siteUrl}${url}`;
            }
            
            // Google OAuth callback URL'i ise siteUrl ile birleştir
            if (url.includes("/api/auth/callback")) {
                return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
            }
            
            // Diğer durumlarda ana sayfaya yönlendir
            return siteUrl;
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

            // Google OAuth için özel kontrol
            if (account?.provider === "google") {
                if (!account.access_token) {
                    console.error("❌ Google OAuth: access_token eksik!");
                    console.error("Account object:", JSON.stringify(account, null, 2));
                    return false;
                }
                if (!user?.email) {
                    console.error("❌ Google OAuth: user email eksik!");
                    console.error("User object:", JSON.stringify(user, null, 2));
                    return false;
                }
                console.log("✅ Google OAuth: Tüm kontroller geçti, giriş onaylandı");
            }

            // Tüm girişlere izin ver
            return true;
        },
        async jwt({ token, account, profile, user }) {
            // JWT callback - user bilgilerini token'a ekle
            if (account) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            if (profile) {
                token.name = (profile as any).name;
                token.picture = (profile as any).picture;
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

"use client";

import { useEffect, useState } from "react";

export default function TestGoogleOAuthPage() {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [googleSignInUrl, setGoogleSignInUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/auth/debug").then((res) => res.json()),
            fetch("/api/auth/google-signin-url").then((res) => res.json()),
        ])
            .then(([debug, signInUrl]) => {
                setDebugInfo(debug);
                setGoogleSignInUrl(signInUrl.url || signInUrl.error);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
                <div className="rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-12">
                    <p className="text-emerald-950">Yükleniyor...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-12">
                <h1 className="mb-6 text-2xl font-extrabold text-emerald-950">
                    Google OAuth Debug Bilgileri
                </h1>

                <div className="space-y-6">
                    <div>
                        <h2 className="mb-2 text-lg font-bold text-emerald-950">
                            1. Environment Variables
                        </h2>
                        <div className="rounded-lg border border-emerald-950/20 bg-emerald-950/5 p-4">
                            <pre className="text-xs text-emerald-950/80 overflow-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-2 text-lg font-bold text-emerald-950">
                            2. Google OAuth URL
                        </h2>
                        <div className="rounded-lg border border-emerald-950/20 bg-emerald-950/5 p-4">
                            {googleSignInUrl ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-emerald-950/70">
                                        URL oluşturuldu:
                                    </p>
                                    <a
                                        href={googleSignInUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block break-all text-xs text-blue-600 underline"
                                    >
                                        {googleSignInUrl}
                                    </a>
                                    <a
                                        href={googleSignInUrl}
                                        className="inline-block rounded-full bg-blue-500 px-6 py-3 text-white font-semibold hover:bg-blue-600"
                                    >
                                        Google ile Giriş Yap (Test)
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-red-600">
                                    Google OAuth URL oluşturulamadı!
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-2 text-lg font-bold text-emerald-950">
                            3. Kontrol Listesi
                        </h2>
                        <div className="rounded-lg border border-emerald-950/20 bg-emerald-950/5 p-4">
                            <ul className="list-disc list-inside space-y-2 text-sm text-emerald-950/80">
                                <li>
                                    Google Cloud Console'da Client ID kontrol et:
                                    <br />
                                    <code className="text-xs bg-white/50 px-2 py-1 rounded">
                                        {debugInfo?.clientIdFull || "NOT SET"}
                                    </code>
                                </li>
                                <li>
                                    Authorized redirect URIs'de şu URL olmalı:
                                    <br />
                                    <code className="text-xs bg-white/50 px-2 py-1 rounded">
                                        {debugInfo?.callbackUrl || "NOT SET"}
                                    </code>
                                </li>
                                <li>
                                    OAuth consent screen'de test users ekli olmalı
                                </li>
                                <li>
                                    Cloudflare Pages'de environment variables ayarlı olmalı
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-2 text-lg font-bold text-emerald-950">
                            4. Hata Çözümü
                        </h2>
                        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                            <p className="text-sm font-semibold text-red-800 mb-2">
                                "invalid_client" hatası alıyorsan:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
                                <li>
                                    Google Cloud Console → APIs & Services → Credentials
                                </li>
                                <li>
                                    Client ID'yi kontrol et:{" "}
                                    <code className="bg-white/50 px-1 rounded">
                                        {debugInfo?.clientIdFull?.substring(0, 30)}...
                                    </code>
                                </li>
                                <li>
                                    Eğer Client ID yoksa, yeni bir OAuth 2.0 Client ID oluştur
                                </li>
                                <li>
                                    Authorized redirect URIs'ye ekle:{" "}
                                    <code className="bg-white/50 px-1 rounded">
                                        {debugInfo?.callbackUrl}
                                    </code>
                                </li>
                                <li>
                                    Yeni Client ID ve Secret'ı Cloudflare Pages'e ekle
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

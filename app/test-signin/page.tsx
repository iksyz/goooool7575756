export default function TestSignInPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-12">
                <h1 className="mb-4 text-2xl font-extrabold text-emerald-950">
                    Test Sign In
                </h1>
                <p className="mb-6 text-sm font-semibold text-emerald-950/70">
                    Bu sayfa sign-in butonunu test etmek için.
                </p>
                
                <div className="space-y-4">
                    <div>
                        <h2 className="mb-2 text-lg font-bold text-emerald-950">
                            1. Direkt Link (En Basit)
                        </h2>
                        <a
                            href="/api/auth/signin/google"
                            className="inline-block rounded-full bg-blue-500 px-6 py-3 text-white font-semibold hover:bg-blue-600"
                        >
                            Google ile Giriş Yap (Direkt Link)
                        </a>
                    </div>
                    
                    <div>
                        <h2 className="mb-2 text-lg font-bold text-emerald-950">
                            2. Button Component ile Link
                        </h2>
                        <a
                            href="/api/auth/signin/google"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-950/10 bg-white/70 px-6 py-3 text-emerald-950/85 font-semibold shadow-[0_10px_30px_rgba(2,44,34,0.10)] backdrop-blur hover:shadow-[0_18px_50px_rgba(2,44,34,0.18)]"
                        >
                            Google ile Giriş Yap (Button Style)
                        </a>
                    </div>
                    
                    <div>
                        <h2 className="mb-2 text-lg font-bold text-emerald-950">
                            3. Direkt Link (Alternatif Stil)
                        </h2>
                        <a
                            href="/api/auth/signin/google"
                            className="inline-block rounded-full bg-green-500 px-6 py-3 text-white font-semibold hover:bg-green-600"
                        >
                            Google ile Giriş Yap (Alternatif)
                        </a>
                    </div>
                </div>
                
                <div className="mt-8 rounded-lg border border-emerald-950/20 bg-emerald-950/5 p-4 text-left">
                    <p className="mb-2 text-xs font-semibold text-emerald-950/80">
                        Debug Bilgisi:
                    </p>
                    <p className="text-xs text-emerald-950/60">
                        Eğer hiçbiri çalışmazsa, tarayıcı konsolunu aç (F12) ve hata mesajlarını kontrol et.
                    </p>
                </div>
            </div>
        </main>
    );
}

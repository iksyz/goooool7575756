import { requireAdmin } from "@/lib/admin";
import { AdminGeneratorClient } from "@/components/admin/AdminGeneratorClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";

export default async function AdminGeneratorPage() {
    const session = await getServerSession(authOptions);
    const admin = await requireAdmin();

    if (!admin.ok) {
        // Kullanıcı giriş yapmamışsa
        if (!session) {
            return (
                <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
                    <div className="rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-12">
                        <h1 className="mb-4 text-2xl font-extrabold text-emerald-950">
                            Giriş Yapın
                        </h1>
                        <p className="mb-6 text-sm font-semibold text-emerald-950/70">
                            Admin paneline erişmek için lütfen giriş yapın.
                        </p>
                        <div className="mb-6 flex justify-center">
                            <AuthButton signedIn={false} />
                        </div>
                        <div className="mt-6 rounded-lg border border-emerald-950/20 bg-emerald-950/5 p-4 text-left">
                            <p className="mb-2 text-xs font-semibold text-emerald-950/80">
                                Debug Bilgisi:
                            </p>
                            <p className="text-xs text-emerald-950/60">
                                Sorun yaşıyorsanız:{" "}
                                <a
                                    href="/api/auth/debug"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    /api/auth/debug
                                </a>{" "}
                                sayfasını kontrol edin.
                            </p>
                        </div>
                    </div>
                </main>
            );
        }

        // Kullanıcı giriş yapmış ama admin değilse
        return (
            <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
                <div className="rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-12">
                    <h1 className="mb-4 text-2xl font-extrabold text-emerald-950">
                        Yetkiniz Yok
                    </h1>
                    <p className="mb-2 text-sm font-semibold text-emerald-950/70">
                        Bu sayfaya erişim için admin yetkisi gereklidir.
                    </p>
                    {admin.email && (
                        <p className="text-xs text-emerald-950/50">
                            Giriş yaptığınız e-posta: {admin.email}
                        </p>
                    )}
                </div>
            </main>
        );
    }

    return <AdminGeneratorClient />;
}

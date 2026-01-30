import { requireAdmin } from "@/lib/admin";
import { AdminGeneratorClient } from "@/components/admin/AdminGeneratorClient";

export default async function AdminGeneratorPage() {
    const admin = await requireAdmin();

    if (!admin.ok) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
                <div className="rounded-3xl border border-white/40 bg-white/70 p-6 text-sm font-semibold text-emerald-950/80 shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-8">
                    Unauthorized
                </div>
            </main>
        );
    }

    return <AdminGeneratorClient />;
}

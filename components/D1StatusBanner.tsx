import { AlertCircle } from "lucide-react";

export function D1StatusBanner() {
    // Sadece development'ta göster
    if (process.env.NODE_ENV === "production") return null;

    return (
        <div className="border-b border-referee-yellow/30 bg-referee-yellow/10 px-4 py-3">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-referee-yellow" />
                <p className="text-sm font-semibold text-emerald-950/80">
                    ⚠️ Database not connected. Quiz scores won't be saved until Cloudflare D1 is set up. 
                    <a 
                        href="/D1_SETUP.md" 
                        className="ml-1 underline hover:text-emerald-950"
                        target="_blank"
                    >
                        See setup guide
                    </a>
                </p>
            </div>
        </div>
    );
}

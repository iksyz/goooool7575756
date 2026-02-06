"use client";

import { signOut } from "next-auth/react";
import { Trophy } from "lucide-react";

import { Button } from "@/components/ui/Button";

type AuthButtonProps =
    | {
        signedIn: false;
    }
    | {
        signedIn: true;
        name?: string | null;
        image?: string | null;
        points: number;
    };

export function AuthButton(props: AuthButtonProps) {
    // NextAuth'un kendi signin route'unu kullan - callbackUrl parametresi ile
    // Bu şekilde callback sonrası otomatik olarak admin sayfasına yönlendirilir
    const signInUrl = "/api/auth/signin/google?callbackUrl=/admin/generator";

    if (!props.signedIn) {
        return (
            <a
                href={signInUrl}
                className="group relative inline-flex items-center justify-center gap-2 h-12 rounded-full px-6 text-sm font-semibold transition-shadow border border-emerald-950/10 bg-white/70 text-emerald-950/85 shadow-[0_10px_30px_rgba(2,44,34,0.10)] backdrop-blur hover:shadow-[0_18px_50px_rgba(2,44,34,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-referee-yellow/60 focus-visible:ring-offset-2"
            >
                Sign In
            </a>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-white/40 bg-white/70 px-3 py-2 shadow-[0_12px_30px_rgba(2,44,34,0.14)] backdrop-blur">
                {props.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={props.image}
                        alt={props.name ?? "Profile"}
                        className="h-9 w-9 rounded-full border border-white/40 object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="h-9 w-9 rounded-full bg-emerald-950/10" />
                )}

                <div className="hidden sm:block leading-tight">
                    <div className="max-w-[160px] truncate text-sm font-extrabold text-emerald-950">
                        {props.name ?? "Player"}
                    </div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-950/70">
                        <Trophy className="h-4 w-4 text-referee-yellow" />
                        {props.points} pts
                    </div>
                </div>

                <div className="sm:hidden inline-flex items-center gap-1 text-xs font-semibold text-emerald-950/80">
                    <Trophy className="h-4 w-4 text-referee-yellow" />
                    {props.points} pts
                </div>
            </div>

            <Button type="button" variant="ghost" onClick={() => signOut()}>
                Sign Out
            </Button>
        </div>
    );
}

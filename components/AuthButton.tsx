"use client";

import { signIn, signOut } from "next-auth/react";
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
    if (!props.signedIn) {
        return (
            <Button
                type="button"
                variant="secondary"
                onClick={() => {
                    console.log("Sign In button clicked");
                    signIn("google")
                        .then(() => {
                            console.log("Sign in successful");
                        })
                        .catch((error) => {
                            console.error("Sign in error:", error);
                            alert(`Giriş hatası: ${error.message || "Bilinmeyen hata"}`);
                        });
                }}
            >
                Sign In
            </Button>
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

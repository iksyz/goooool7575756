"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Trophy, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

const brandFont = Poppins({ subsets: ["latin"], weight: ["800"] });

type NavItem = {
    href: string;
    label: string;
};

const NAV_ITEMS: NavItem[] = [
    { href: "/quiz", label: "Quizzes" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/profile", label: "My Stats" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
];

type NavbarMobileMenuProps =
    | {
        signedIn: false;
    }
    | {
        signedIn: true;
        name?: string | null;
        image?: string | null;
        points: number;
    };

export function NavbarMobileMenu(props: NavbarMobileMenuProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/70 text-emerald-950 shadow-[0_12px_30px_rgba(2,44,34,0.12)] backdrop-blur transition-colors hover:bg-white/80"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        className="fixed inset-0 z-[60]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        <div className="absolute inset-0 bg-emerald-950/60" onClick={() => setOpen(false)} />

                        <motion.div
                            className="absolute inset-x-0 top-0 h-[100svh] overflow-auto border-b border-white/30 bg-[color:rgba(248,250,252,0.78)] backdrop-blur-2xl"
                            initial={{ y: -24, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -24, opacity: 0 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            role="dialog"
                            aria-modal="true"
                        >
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-90"
                                style={{
                                    background:
                                        "radial-gradient(800px circle at 15% 10%, rgba(34,197,94,0.18), transparent 55%), radial-gradient(700px circle at 90% 25%, rgba(250,204,21,0.18), transparent 60%)",
                                }}
                            />

                            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                                <Link href="/" onClick={() => setOpen(false)} className="group inline-flex items-center gap-3">
                                    <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/55 bg-white/65 shadow-[0_18px_50px_rgba(2,44,34,0.18)] backdrop-blur">
                                        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-emerald-950/10" />
                                        <span className="pointer-events-none absolute -inset-2 rounded-[20px] bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.28),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.16),transparent_55%)] opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
                                        <Image
                                            src="/goaltriviafavicon.jpeg"
                                            alt="Goaltrivia"
                                            width={38}
                                            height={38}
                                            priority
                                            className="relative rounded-xl"
                                        />
                                    </span>
                                    <span
                                        suppressHydrationWarning
                                        translate="no"
                                        className={
                                            brandFont.className +
                                            " text-2xl font-extrabold tracking-tight sm:text-3xl"
                                        }
                                    >
                                        <span className="bg-[linear-gradient(90deg,_#fff7d6_0%,_#ffd36b_22%,_#fff2b0_45%,_#f6b23a_70%,_#fff7d6_100%)] bg-clip-text text-transparent drop-shadow-[0_14px_30px_rgba(250,204,21,0.28)] transition-[filter] duration-300 group-hover:drop-shadow-[0_16px_34px_rgba(250,204,21,0.36)]">
                                            GoalTrivia
                                        </span>
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/70 text-emerald-950 shadow-[0_12px_30px_rgba(2,44,34,0.12)] backdrop-blur transition-colors hover:bg-white/80"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="relative mx-auto flex min-h-[calc(100svh-88px)] max-w-6xl flex-col items-center justify-center gap-7 px-6 py-10">
                                <nav className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
                                    {NAV_ITEMS.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className="w-full rounded-3xl border border-emerald-950/10 bg-white/85 px-6 py-4 text-[22px] font-extrabold tracking-tight text-emerald-950 shadow-[0_18px_60px_rgba(2,44,34,0.12)] transition-transform hover:-translate-y-[1px]"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>

                                {props.signedIn ? (
                                    <div className="w-full max-w-sm rounded-3xl border border-emerald-950/10 bg-white/85 p-5 shadow-[0_18px_60px_rgba(2,44,34,0.12)]">
                                        <div className="flex items-center gap-4">
                                            {props.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={props.image}
                                                    alt={props.name ?? "Profile"}
                                                    className="h-12 w-12 rounded-full border border-white/40 object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-emerald-950/10" />
                                            )}

                                            <div className="min-w-0">
                                                <div className="truncate text-base font-extrabold text-emerald-950">
                                                    {props.name ?? "Player"}
                                                </div>
                                                <div className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-emerald-950/80">
                                                    <Trophy className="h-4 w-4 text-referee-yellow" />
                                                    {props.points} pts
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (() => {
                                    // Direkt Google OAuth URL'ini oluştur
                                    const clientId = "405208981746-qipip7oe7okutjvp90906vhbhq0c03i6.apps.googleusercontent.com";
                                    const baseUrl = "https://goaltrivia.com";
                                    const redirectUri = `${baseUrl}/api/auth/callback/google`;
                                    
                                    const params = new URLSearchParams({
                                        client_id: clientId,
                                        redirect_uri: redirectUri,
                                        response_type: "code",
                                        scope: "openid email profile",
                                        access_type: "offline",
                                        prompt: "consent",
                                    });
                                    
                                    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
                                    
                                    return (
                                        <div className="w-full max-w-sm">
                                            <a
                                                href={googleOAuthUrl}
                                                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-200 via-referee-yellow to-amber-400 px-6 py-5 text-[22px] font-extrabold tracking-tight text-emerald-950 shadow-[0_26px_90px_rgba(250,204,21,0.35)] ring-1 ring-emerald-950/10 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-referee-yellow/60 focus-visible:ring-offset-2"
                                            >
                                                <span className="absolute inset-0 -z-10 bg-gradient-to-b from-white/40 via-transparent to-black/5" />
                                                <span className="absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                                Sign In
                                            </a>
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

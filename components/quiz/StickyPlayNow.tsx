"use client";

import { useEffect, useState } from "react";

type StickyPlayNowProps = {
    href: string;
    label?: string;
};

export function StickyPlayNow({ href, label = "Play Now" }: StickyPlayNowProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > 520);
        }

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
            className={
                "pointer-events-none fixed inset-x-0 bottom-0 z-50 p-4 transition-transform duration-300 " +
                (visible ? "translate-y-0" : "translate-y-[110%]")
            }
        >
            <div className="mx-auto max-w-6xl">
                <a
                    href={href}
                    className="pointer-events-auto inline-flex w-full items-center justify-center rounded-full bg-pitch-green px-5 py-3 text-sm font-extrabold text-stadium-white shadow-[0_18px_60px_rgba(2,44,34,0.22)] transition-transform hover:-translate-y-[1px] sm:ml-auto sm:w-auto"
                >
                    {label}
                </a>
            </div>
        </div>
    );
}

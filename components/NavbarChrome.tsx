"use client";

import { useEffect, useState } from "react";

export function NavbarChrome({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let lastY = window.scrollY;
        let lastToggleY = window.scrollY;

        function onScroll() {
            const y = window.scrollY;
            setScrolled(y > 8);

            if (y < 8) {
                setVisible(true);
                lastY = y;
                lastToggleY = y;
                return;
            }

            const delta = y - lastY;

            if (delta > 0 && y - lastToggleY > 40) {
                setVisible(false);
                lastToggleY = y;
            } else if (delta < 0 && lastToggleY - y > 20) {
                setVisible(true);
                lastToggleY = y;
            }

            lastY = y;
        }

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true } as any);
        return () => window.removeEventListener("scroll", onScroll as any);
    }, []);

    return (
        <header
            className={
                "sticky top-0 z-50 border-b backdrop-blur transition-[background-color,box-shadow,border-color,transform,opacity] duration-500 ease-out will-change-transform " +
                (visible ? "translate-y-0 opacity-100 " : "-translate-y-full opacity-0 pointer-events-none ") +
                (scrolled
                    ? "border-[color:rgba(5,46,22,0.14)] bg-[color:rgba(248,250,252,0.88)] shadow-[0_12px_36px_rgba(2,44,34,0.14)]"
                    : "border-[color:rgba(5,46,22,0.08)] bg-[color:rgba(248,250,252,0.65)]")
            }
        >
            {children}
        </header>
    );
}

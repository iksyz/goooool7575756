"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

function isActive(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavbarLinks() {
    const pathname = usePathname() || "/";

    return (
        <nav className="flex items-center gap-4 text-sm font-semibold text-[color:rgba(5,46,22,0.82)] sm:gap-6">
            {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={
                            "relative transition-colors hover:text-pitch-green" +
                            (active
                                ? " text-pitch-green after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-pitch-green"
                                : "")
                        }
                        aria-current={active ? "page" : undefined}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

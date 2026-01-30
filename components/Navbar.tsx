import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthButton } from "@/components/AuthButton";
import { NavbarChrome } from "@/components/NavbarChrome";
import { NavbarLinks } from "@/components/NavbarLinks";
import { NavbarMobileMenu } from "@/components/NavbarMobileMenu";

const brandFont = Poppins({ subsets: ["latin"], weight: ["800"] });

export async function Navbar() {
    const session = await getServerSession(authOptions);

    const userId = (session?.user as any)?.id as string | undefined;
    const email = session?.user?.email ?? undefined;

    const user = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : email
            ? await prisma.user.findUnique({ where: { email } })
            : null;

    const points = user?.totalPoints ?? 0;

    return (
        <NavbarChrome>
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-3 text-pitch-green"
                    translate="no"
                >
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
                            " text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl"
                        }
                    >
                        <span className="bg-[linear-gradient(90deg,_#fff7d6_0%,_#ffd36b_22%,_#fff2b0_45%,_#f6b23a_70%,_#fff7d6_100%)] bg-clip-text text-transparent drop-shadow-[0_14px_30px_rgba(250,204,21,0.28)] transition-[filter] duration-300 group-hover:drop-shadow-[0_16px_34px_rgba(250,204,21,0.36)]">
                            GoalTrivia
                        </span>
                    </span>
                </Link>

                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="hidden md:flex items-center gap-4 sm:gap-6">
                        <NavbarLinks />

                        {session?.user ? (
                            <AuthButton
                                signedIn
                                name={session.user.name}
                                image={session.user.image}
                                points={points}
                            />
                        ) : (
                            <AuthButton signedIn={false} />
                        )}
                    </div>

                    {session?.user ? (
                        <NavbarMobileMenu
                            signedIn
                            name={session.user.name}
                            image={session.user.image}
                            points={points}
                        />
                    ) : (
                        <NavbarMobileMenu signedIn={false} />
                    )}
                </div>
            </div>
        </NavbarChrome>
    );
}

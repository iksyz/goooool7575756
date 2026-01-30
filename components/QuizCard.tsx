import Link from "next/link";

type QuizCardProps = {
    title: string;
    subtitle?: string;
    href: string;
};

export function QuizCard({ title, subtitle, href }: QuizCardProps) {
    return (
        <Link
            href={href}
            className="group relative block overflow-hidden rounded-3xl border border-[color:rgba(5,46,22,0.12)] bg-white p-6 shadow-premium transition-shadow hover:shadow-premium-strong"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                    background:
                        "radial-gradient(900px circle at 20% 10%, rgba(22,163,74,0.18), transparent 55%), radial-gradient(700px circle at 90% 30%, rgba(250,204,21,0.18), transparent 52%)",
                }}
            />
            <div className="relative">
                <h3 className="break-words text-xl font-extrabold tracking-tight text-[color:rgba(5,46,22,0.92)]">
                    {title}
                </h3>
                {subtitle ? (
                    <p className="mt-2 break-words text-sm leading-6 text-[color:rgba(5,46,22,0.72)]">
                        {subtitle}
                    </p>
                ) : null}
            </div>
        </Link>
    );
}

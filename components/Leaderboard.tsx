type LeaderboardEntry = {
    name: string;
    score: number;
};

type LeaderboardProps = {
    title?: string;
    entries: LeaderboardEntry[];
};

export function Leaderboard({ title = "Leaderboard", entries }: LeaderboardProps) {
    return (
        <section className="rounded-3xl border border-[color:rgba(5,46,22,0.12)] bg-white p-6 shadow-premium">
            <h2 className="text-lg font-extrabold tracking-tight text-[color:rgba(5,46,22,0.92)]">
                {title}
            </h2>
            <ol className="mt-4 space-y-3">
                {entries.map((e, idx) => (
                    <li
                        key={`${e.name}-${idx}`}
                        className="flex items-center justify-between rounded-2xl bg-[color:rgba(248,250,252,0.85)] px-4 py-3"
                    >
                        <span className="text-sm font-semibold text-[color:rgba(5,46,22,0.82)]">
                            {idx + 1}. {e.name}
                        </span>
                        <span className="text-sm font-extrabold text-pitch-green">
                            {e.score}
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

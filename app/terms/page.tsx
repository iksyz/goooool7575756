export default function TermsPage() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-16">
            <header className="mx-auto max-w-3xl">
                <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-8">
                    <h1 className="text-balance text-4xl font-extrabold tracking-tight text-emerald-950 drop-shadow-[0_10px_24px_rgba(2,44,34,0.14)] sm:text-5xl">
                        Terms
                    </h1>
                    <p className="mt-4 text-base leading-8 text-emerald-950/80">
                        These Terms govern your use of Goaltrivia.
                    </p>
                </div>
            </header>

            <section className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/40 bg-white/70 p-6 text-sm leading-7 text-emerald-950/75 shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-8">
                <h2 className="text-lg font-extrabold text-emerald-950">Use of the service</h2>
                <p className="mt-3">
                    Goaltrivia is provided "as is" for entertainment and educational purposes. You agree to use the site responsibly
                    and not to misuse the service.
                </p>

                <h2 className="mt-8 text-lg font-extrabold text-emerald-950">Accounts and points</h2>
                <p className="mt-3">
                    If you sign in, your account may store quiz results and points for leaderboards. We may update scoring, quiz
                    availability, or features over time.
                </p>

                <h2 className="mt-8 text-lg font-extrabold text-emerald-950">Content</h2>
                <p className="mt-3">
                    All quizzes are football-related. You may not copy, scrape, or redistribute site content without permission.
                </p>

                <h2 className="mt-8 text-lg font-extrabold text-emerald-950">Contact</h2>
                <p className="mt-3">For questions about these Terms, please use the contact details on the About page.</p>
            </section>
        </main>
    );
}

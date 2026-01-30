export default function PrivacyPolicyPage() {
    return (
        <main className="mx-auto max-w-6xl px-6 py-16">
            <header className="mx-auto max-w-3xl">
                <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-8">
                    <h1 className="text-balance text-4xl font-extrabold tracking-tight text-emerald-950 drop-shadow-[0_10px_24px_rgba(2,44,34,0.14)] sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-base leading-8 text-emerald-950/80">
                        This Privacy Policy explains how Goaltrivia collects, uses, and protects your information.
                    </p>
                </div>
            </header>

            <section className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/40 bg-white/70 p-6 text-sm leading-7 text-emerald-950/75 shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-8">
                <h2 className="text-lg font-extrabold text-emerald-950">Overview</h2>
                <p className="mt-3">
                    Goaltrivia is a football-only quiz experience. We aim to collect as little personal data as possible while still
                    providing core features such as authentication, scoring, and leaderboards.
                </p>

                <h2 className="mt-8 text-lg font-extrabold text-emerald-950">Information we may collect</h2>
                <p className="mt-3">
                    If you sign in, we may receive basic profile information from your identity provider (for example: name, email,
                    and profile image). We may also store gameplay activity such as quiz results and points.
                </p>

                <h2 className="mt-8 text-lg font-extrabold text-emerald-950">Cookies and analytics</h2>
                <p className="mt-3">
                    We may use cookies for login sessions and site functionality. If analytics or advertising tools are enabled in
                    the future, they may set additional cookies.
                </p>

                <h2 className="mt-8 text-lg font-extrabold text-emerald-950">Contact</h2>
                <p className="mt-3">
                    For privacy questions, please use the contact details on the About page.
                </p>
            </section>
        </main>
    );
}

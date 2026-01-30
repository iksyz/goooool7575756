 import Link from "next/link";

 export function Footer() {
     return (
         <footer className="border-t border-[color:rgba(5,46,22,0.08)] bg-[color:rgba(248,250,252,0.85)]">
             <div className="mx-auto max-w-6xl px-6 py-12">
                 <div className="grid gap-10 md:grid-cols-12">
                     <div className="md:col-span-5">
                         <div className="text-lg font-extrabold tracking-tight text-pitch-green" translate="no">
                             <span suppressHydrationWarning translate="no">
                                 Goaltrivia
                             </span>
                         </div>
                         <p className="mt-3 max-w-sm text-sm leading-6 text-[color:rgba(5,46,22,0.72)]">
                             Premium, football-only quizzes built for matchday focus, fast decisions, and real football knowledge.
                         </p>
                     </div>

                     <div className="md:col-span-3">
                         <div className="text-xs font-extrabold tracking-widest text-emerald-950/70">EXPLORE</div>
                         <nav className="mt-4 grid gap-2 text-sm font-semibold text-emerald-950/75">
                             <Link href="/quiz" className="transition-colors hover:text-pitch-green">
                                 Quizzes
                             </Link>
                             <Link href="/leaderboard" className="transition-colors hover:text-pitch-green">
                                 Leaderboard
                             </Link>
                             <Link href="/about" className="transition-colors hover:text-pitch-green">
                                 About
                             </Link>
                         </nav>
                     </div>

                     <div className="md:col-span-4">
                         <div className="text-xs font-extrabold tracking-widest text-emerald-950/70">LEGAL</div>
                         <nav className="mt-4 grid gap-2 text-sm font-semibold text-emerald-950/75">
                             <Link href="/privacy-policy" className="transition-colors hover:text-pitch-green">
                                 Privacy Policy
                             </Link>
                             <Link href="/terms" className="transition-colors hover:text-pitch-green">
                                 Terms
                             </Link>
                             <Link href="/about" className="transition-colors hover:text-pitch-green">
                                 Contact & About
                             </Link>
                         </nav>
                     </div>
                 </div>

                 <div className="mt-10 flex flex-col gap-2 border-t border-[color:rgba(5,46,22,0.08)] pt-6 text-xs text-[color:rgba(5,46,22,0.62)] sm:flex-row sm:items-center sm:justify-between">
                     <div>© {new Date().getFullYear()} Goaltrivia. Football only.</div>
                     <div>Built for football fans. No spam. No noise.</div>
                 </div>
             </div>
         </footer>
     );
 }

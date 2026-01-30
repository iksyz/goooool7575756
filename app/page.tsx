"use client";

import { motion } from "framer-motion";
import { Goal } from "lucide-react";
import { QuizCatalog } from "@/components/QuizCatalog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import quizzes from "@/data/quizzes.json";

type SeededQuiz = {
  slug: string;
  title: string;
  league: string;
  category: string;
  difficulty: string;
  seoDescription: string;
  pointsPerCorrect: number;
  timeSeconds?: number;
  questions?: unknown[];
};

function getDailyQuiz(list: SeededQuiz[]): SeededQuiz | null {
  if (!list.length) return null;

  const sorted = [...list].sort(
    (a, b) => (b.pointsPerCorrect ?? 0) - (a.pointsPerCorrect ?? 0)
  );

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();
  const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  const idx = hash % sorted.length;
  return sorted[idx];
}

export default function Home() {
  const seeded = quizzes as unknown as SeededQuiz[];
  const daily = getDailyQuiz(seeded);
  const featured = seeded?.[0] ?? null;
  const featuredQuestionCount = featured?.questions?.length ?? 0;
  const featuredMinutes = featuredQuestionCount ? Math.max(1, Math.ceil((featuredQuestionCount * 15) / 60)) : 0;

  return (
    <div className="min-h-screen bg-transparent text-emerald-950">
      <main className="relative isolate mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
        <section className="grid items-start gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative max-w-xl rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-80"
                style={{
                  background:
                    "radial-gradient(900px circle at 15% 15%, rgba(250,204,21,0.22), transparent 55%), radial-gradient(800px circle at 90% 50%, rgba(37,99,235,0.14), transparent 60%)",
                }}
              />

              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="relative text-balance text-5xl font-extrabold leading-[1.02] tracking-tight text-emerald-950 drop-shadow-[0_10px_24px_rgba(2,44,34,0.18)] sm:text-6xl"
              >
                <span className="bg-gradient-to-b from-emerald-950 to-emerald-800 bg-clip-text text-transparent">
                  Test Your Football IQ
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
                className="relative mt-5 text-lg leading-8 text-emerald-950/70"
              >
                Test your football knowledge with stadium-themed, football-only quizzes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.14 }}
                className="relative mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Button
                  as={motion.a}
                  href="#featured"
                  variant="primary"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  <span
                    className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 blur-xl transition-opacity group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 20%, rgba(250,204,21,0.55), rgba(22,163,74,0.25), transparent 60%)",
                    }}
                  />
                  <Goal className="h-5 w-5" />
                  Start Quiz
                </Button>

                <Button
                  as={motion.a}
                  href="/quiz"
                  variant="secondary"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  Browse Quizzes
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <div className="md:col-span-5">
            <motion.div
              id="featured"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.18 }}
            >
              <Card className="shadow-premium">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-90"
                  style={{
                    background:
                      "radial-gradient(1200px circle at 20% 10%, rgba(22,163,74,0.18), transparent 55%), radial-gradient(900px circle at 90% 30%, rgba(250,204,21,0.22), transparent 52%)",
                  }}
                />

                <CardHeader>
                  <div className="inline-flex items-center gap-2 rounded-full bg-pitch-green/10 px-3 py-1 text-sm font-semibold text-emerald-950/80">
                    <span className="h-2 w-2 rounded-full bg-referee-yellow" />
                    Featured Quiz
                  </div>

                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-emerald-950 drop-shadow-[0_10px_24px_rgba(2,44,34,0.12)]">
                    {featured?.title ?? "Featured Quiz"}
                  </h2>
                  <p className="mt-2 text-base leading-7 text-emerald-950/70">
                    {featured?.seoDescription ?? "Pick a quiz and test your football knowledge."}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-stadium-white/90 p-3 shadow-[0_10px_30px_rgba(2,44,34,0.08)]">
                      <div className="text-xs font-semibold text-emerald-950/60">Questions</div>
                      <div className="mt-1 text-lg font-extrabold text-emerald-950">{featuredQuestionCount || "—"}</div>
                    </div>
                    <div className="rounded-2xl bg-stadium-white/90 p-3 shadow-[0_10px_30px_rgba(2,44,34,0.08)]">
                      <div className="text-xs font-semibold text-emerald-950/60">Time</div>
                      <div className="mt-1 text-lg font-extrabold text-emerald-950">
                        {featuredMinutes ? `${featuredMinutes} mins` : "—"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-stadium-white/90 p-3 shadow-[0_10px_30px_rgba(2,44,34,0.08)]">
                      <div className="text-xs font-semibold text-emerald-950/60">Level</div>
                      <div className="mt-1 text-lg font-extrabold text-emerald-950">{featured?.difficulty ?? "—"}</div>
                    </div>
                  </div>

                  <Button
                    as={motion.a}
                    href={featured ? `/quiz/${featured.slug}` : "/quiz"}
                    className="mt-6 w-full rounded-2xl bg-var-blue"
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    <span
                      className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 20%, rgba(250,204,21,0.45), rgba(37,99,235,0.35), transparent 60%)",
                      }}
                    />
                    <Goal className="h-5 w-5" />
                    Play Featured Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {daily ? (
          <section className="relative">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
              className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-80"
                style={{
                  background:
                    "radial-gradient(900px circle at 12% 18%, rgba(250,204,21,0.24), transparent 55%), radial-gradient(850px circle at 85% 60%, rgba(37,99,235,0.16), transparent 60%)",
                }}
              />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-pitch-green/10 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                      Daily Top Trivia
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-950/5 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                      {daily.pointsPerCorrect} pts / correct
                    </span>
                    <span className="inline-flex items-center rounded-full bg-referee-yellow/20 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                      {daily.difficulty}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-var-blue/10 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                      {daily.league}
                    </span>
                  </div>

                  <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-emerald-950 drop-shadow-[0_10px_24px_rgba(2,44,34,0.14)] sm:text-4xl">
                    {daily.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-emerald-950/75">
                    {daily.seoDescription}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    as={motion.a}
                    href={`/quiz/${daily.slug}`}
                    variant="primary"
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    Play Daily
                  </Button>
                  <Button
                    as={motion.a}
                    href="/quiz"
                    variant="secondary"
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                  >
                    View All Quizzes
                  </Button>
                </div>
              </div>
            </motion.div>
          </section>
        ) : null}

        <QuizCatalog
          quizzes={seeded}
          title="Browse by Category"
          description="Choose a category to filter instantly—no reload, just smooth matchday flow."
          showTrending
        />

        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-emerald-950 drop-shadow-[0_10px_24px_rgba(2,44,34,0.12)]">
            Why GoalTrivia?
          </h2>
          <div className="prose prose-sm mt-4 max-w-none text-emerald-950/80 prose-headings:text-emerald-950 prose-strong:text-emerald-950">
            <p>
              Football is not just a game—it is a global language. It is the roar of a stadium under floodlights, the tension
              of a knockout night, and the split-second decisions that turn pressure into glory. From the UEFA Champions League
              and the Premier League to the World Cup and the fiercest derbies, football writes stories that live forever:
              last-minute winners, legendary managers, iconic shirts, and eras defined by tactics and mentality.
            </p>
            <p>
              GoalTrivia turns that passion into skill. The best football knowledge is not random memorisation—it is understanding
              context: why a high press breaks build-up, how a low block protects the box, what xG reveals about chance quality,
              and how VAR can flip momentum in a heartbeat. Our football quizzes are designed to sharpen your recall, expand your
              tactical vocabulary, and help you recognise patterns across leagues, clubs, players, and seasons.
            </p>
            <p>
              Think of it as match preparation for your mind. Timed questions train focus and fast decision-making—the same
              instincts you use when reading a match, debating a transfer, or predicting a big fixture. Each round helps you build
              mental models: Which season did that record fall? Who assisted the goal? Which law applies in that offside scenario?
              This kind of learning, through smart repetition, sticks—and it makes every match you watch more meaningful.
            </p>
            <p>
              Because football is truly global, the angles never run out: legendary strikers, midfield conductors, defensive greats,
              iconic refereeing moments, famous stadium atmospheres, and the evolution of modern tactics. Whether you live for
              European nights or domestic title races, GoalTrivia keeps you connected to what matters most—goals, records, football
              history, clubs, managers, and the players who defined an era.
            </p>
            <p>
              If you love football, you already know the truth: one moment can change everything. A quiz is a way to relive those
              moments, challenge friends, and discover stories you missed. Start with the featured picks, take on the Daily Top Trivia,
              climb the leaderboard, and keep your football IQ ready for every matchday.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

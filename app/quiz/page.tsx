import popular from "@/data/quizzes/popular.json";
import weekly from "@/data/leaderboard/weekly.json";
import quizzes from "@/data/quizzes.json";
import { Leaderboard } from "@/components/Leaderboard";
import { QuizCard } from "@/components/QuizCard";
import { QuizCatalog } from "@/components/QuizCatalog";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { InteractiveQuiz } from "@/components/quiz/InteractiveQuiz";

type PopularQuiz = {
    id: string;
    title: string;
    tag: string;
};

type WeeklyEntry = {
    name: string;
    score: number;
};

type SeededQuiz = {
    slug: string;
    title: string;
    league: string;
    category: string;
    difficulty: string;
    pointsPerCorrect: number;
    seoDescription: string;
};

export default function QuizPage() {
    const popularQuizzes = popular as PopularQuiz[];
    const weeklyEntries = weekly as WeeklyEntry[];
    const seededQuizzes = quizzes as unknown as SeededQuiz[];

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
            <section className="mx-auto mt-10 max-w-6xl">
                <QuizCatalog
                    quizzes={seededQuizzes}
                    title="Browse Quizzes"
                    description="Filter by category instantly—no reload. See what’s trending and jump straight into matchday mode."
                    showTrending
                />
            </section>

            <section className="mt-10 grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <InteractiveQuiz />
                </div>

                <aside className="lg:col-span-4">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">
                                    Popular Quizzes
                                </h2>
                                <p className="mt-1 text-sm text-emerald-950/70">
                                    The most played football quizzes right now.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    {popularQuizzes.map((q) => (
                                        <QuizCard
                                            key={q.id}
                                            title={q.title}
                                            subtitle={q.tag}
                                            href="/quiz"
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Leaderboard title="Weekly Leaderboard" entries={weeklyEntries} />
                    </div>
                </aside>
            </section>

            <section className="mt-10 grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">
                                Did You Know?
                            </h2>
                            <p className="mt-1 text-sm text-emerald-950/70">
                                Quick facts from the world of football.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 text-sm text-emerald-950/75">
                                <p>
                                    In a football match, the ball’s circumference must be between 68 and 70 cm. Standardized dimensions
                                    help keep the game consistent across different leagues and pitches.
                                </p>
                                <p>
                                    Set pieces (free kicks, corners, throw-ins, and penalties) can heavily influence expected goals in
                                    modern football. Many teams dedicate a major part of training to these routines.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-5">
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">
                                Football Glossary
                            </h2>
                            <p className="mt-1 text-sm text-emerald-950/70">
                                Terms you may see while playing the quiz.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4">
                                <div>
                                    <dt className="text-sm font-extrabold text-emerald-950">Pressing</dt>
                                    <dd className="mt-1 text-sm text-emerald-950/75">
                                        Applying pressure when the opponent has the ball. The goal is to limit passing options and win it back.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-extrabold text-emerald-950">Transition Play</dt>
                                    <dd className="mt-1 text-sm text-emerald-950/75">
                                        The phase right after winning or losing possession, when a team shifts into attack or defense.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-extrabold text-emerald-950">xG (Expected Goals)</dt>
                                    <dd className="mt-1 text-sm text-emerald-950/75">
                                        A metric that estimates how likely a shot is to become a goal based on chance quality.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-extrabold text-emerald-950">Block</dt>
                                    <dd className="mt-1 text-sm text-emerald-950/75">
                                        A team’s defensive shape. Often described as a low, mid, or high block.
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="mt-10">
                <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-8">
                    <h2 className="text-xl font-extrabold tracking-tight text-emerald-950">About these quizzes</h2>
                    <p className="mt-4 text-base leading-8 text-emerald-950/80">
                        Football quizzes are more than a quick game. When designed well, they help you learn faster and watch
                        matches with a sharper eye. On this page, you will find questions connected to today’s football culture,
                        along with short mini-tests that reinforce core rules (offside, penalties, VAR, and more). The goal is not
                        random memorization, but understanding why decisions happen on the pitch and getting comfortable with the
                        tactical language of the game. Concepts like pressing, defensive blocks, transitions, and set-piece
                        routines often decide modern matches. Testing these ideas in small chunks improves your football vocabulary
                        and strengthens your ability to “read” the game while watching your favorite league. In the interactive quiz
                        below, you can answer questions to build your score, explore popular quizzes on the right, and track the
                        weekly leaderboard.
                    </p>
                </div>
            </section>
        </main>
    );
}

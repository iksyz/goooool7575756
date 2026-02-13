import { readFile, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { pingAllSearchEngines } from "@/lib/sitemap";

type QuizOption = {
    text: string;
    funFact: string;
};

type QuizQuestion = {
    question: string;
    options: QuizOption[];
    correctIndex: number;
};

type QuizData = {
    slug: string;
    title: string;
    league: string;
    category: string;
    difficulty: string;
    seoDescription: string;
    seoContent?: string;
    seoKeywords?: string[];
    pointsPerCorrect: number;
    timeSeconds?: number;
    questions: QuizQuestion[];
};

function slugify(input: string) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80);
}

function ensureUniqueSlug(base: string, existing: Set<string>) {
    let slug = base;
    let i = 2;
    while (existing.has(slug)) {
        slug = `${base}-${i}`;
        i += 1;
    }
    return slug;
}

function validateQuiz(q: any): QuizData {
    const slug = typeof q?.slug === "string" ? q.slug.trim() : "";
    const title = typeof q?.title === "string" ? q.title.trim() : "";
    const league = typeof q?.league === "string" ? q.league.trim() : "";
    const category = typeof q?.category === "string" ? q.category.trim() : "";
    const difficulty = typeof q?.difficulty === "string" ? q.difficulty.trim() : "";
    const seoDescription = typeof q?.seoDescription === "string" ? q.seoDescription.trim() : "";
    const seoContent = typeof q?.seoContent === "string" ? q.seoContent.trim() : undefined;
    const seoKeywords = Array.isArray(q?.seoKeywords)
        ? q.seoKeywords.filter((v: any) => typeof v === "string").map((v: string) => v.trim()).filter(Boolean)
        : undefined;
    const pointsPerCorrect = typeof q?.pointsPerCorrect === "number" ? q.pointsPerCorrect : 10;
    const timeSeconds = typeof q?.timeSeconds === "number" ? q.timeSeconds : 15;

    const questionsRaw = Array.isArray(q?.questions) ? q.questions : [];
    const questions: QuizQuestion[] = questionsRaw
        .map((qq: any) => {
            const question = typeof qq?.question === "string" ? qq.question.trim() : "";
            const correctIndex = typeof qq?.correctIndex === "number" ? qq.correctIndex : -1;
            const optionsRaw = Array.isArray(qq?.options) ? qq.options : [];
            const options: QuizOption[] = optionsRaw
                .map((o: any) => ({
                    text: typeof o?.text === "string" ? o.text.trim() : "",
                    funFact: typeof o?.funFact === "string" ? o.funFact.trim() : "",
                }))
                .slice(0, 4);

            return { question, options, correctIndex };
        })
        .filter((qq: QuizQuestion) => {
            return (
                qq.question.length > 0 &&
                qq.options.length === 4 &&
                qq.options.every((o) => o.text.length > 0 && o.funFact.length > 0) &&
                Number.isInteger(qq.correctIndex) &&
                qq.correctIndex >= 0 &&
                qq.correctIndex < 4
            );
        });

    if (!title || !league || !category || !difficulty || !seoDescription) {
        throw new Error("Invalid quiz payload: missing required fields");
    }

    if (questions.length < 10) {
        throw new Error("Invalid quiz payload: need at least 10 valid questions");
    }

    const normalizedSlug = slug ? slugify(slug) : slugify(title);
    if (!normalizedSlug) throw new Error("Invalid slug");

    return {
        slug: normalizedSlug,
        title,
        league,
        category,
        difficulty,
        seoDescription,
        seoContent,
        seoKeywords,
        pointsPerCorrect,
        timeSeconds,
        questions: questions.slice(0, 10),
    };
}

export async function POST(req: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin.ok) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const quiz = validateQuiz(body?.quiz);

        const filePath = path.join(process.cwd(), "data", "quizzes.json");
        const raw = await readFile(filePath, "utf8");
        const list = (JSON.parse(raw) as unknown[]).filter(Boolean) as any[];

        const slugs = new Set(list.map((q) => (typeof q?.slug === "string" ? q.slug : "")).filter(Boolean));
        const finalSlug = ensureUniqueSlug(quiz.slug, slugs);

        const nextQuiz: QuizData = { ...quiz, slug: finalSlug };
        const nextList = [nextQuiz, ...list];

        await writeFile(filePath, JSON.stringify(nextList, null, 4) + "\n", "utf8");

        // Sitemap ve quiz sayfalarını revalidate et
        revalidatePath("/sitemap.xml");
        revalidatePath("/quiz");
        revalidatePath(`/quiz/${finalSlug}`);
        revalidatePath(`/quiz/${finalSlug}/play`);
        revalidatePath("/"); // Ana sayfa da güncellensin

        console.log(`✅ Quiz saved and revalidated: ${finalSlug}`);

        // Arama motorlarına sitemap güncellendiğini bildir (async, response bekleme)
        pingAllSearchEngines()
            .then(result => {
                console.log("🔔 Sitemap ping results:", result);
            })
            .catch(err => {
                console.error("❌ Sitemap ping error:", err);
            });

        return Response.json({ ok: true, slug: finalSlug });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ error: message }, { status: 500 });
    }
}

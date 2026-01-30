import { aiFilter } from "@/lib/ai/aiFilter";
import { requireAdmin } from "@/lib/admin";

type GeneratedQuizQuestion = {
    question: string;
    options: string[];
    correctIndex: number;
    didYouKnow: string;
};

type GeneratedQuizResponse = {
    topic: string;
    timeSeconds: number;
    questions: GeneratedQuizQuestion[];
};

type GeneratedFullQuizOption = {
    text: string;
    funFact: string;
};

type GeneratedFullQuizQuestion = {
    question: string;
    options: [GeneratedFullQuizOption, GeneratedFullQuizOption, GeneratedFullQuizOption, GeneratedFullQuizOption];
    correctIndex: 0 | 1 | 2 | 3;
};

type GeneratedFullQuizResponse = {
    slug: string;
    title: string;
    league: string;
    category: string;
    difficulty: string;
    seoDescription: string;
    seoKeywords: string[];
    seoContent: string;
    pointsPerCorrect: number;
    timeSeconds: number;
    questions: GeneratedFullQuizQuestion[];
};

function wordCount(text: string) {
    return text.split(/\s+/).filter(Boolean).length;
}

function titleKeywords(title: string) {
    return title
        .split(/[^a-zA-Z0-9]+/g)
        .map((w) => w.trim())
        .filter((w) => w.length >= 4)
        .map((w) => w.toLowerCase());
}

function uniqueKeywords(list: string[]) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const k of list) {
        const v = k.trim();
        if (!v) continue;
        const key = v.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(v);
    }
    return out;
}

function buildSeoFallbackText(input: {
    title: string;
    league: string;
    category: string;
    difficulty: string;
    keywords: string[];
}) {
    const keywordLine = input.keywords.slice(0, 18).join(", ");

    const p1 = `If you're looking for a football quiz that is truly about ${input.title}, this page is designed to match the way fans actually search and learn. The quiz focuses on the stories, records, and match moments that shaped the topic, connecting facts to context so the answers feel meaningful instead of random. Because ${input.league} comes with its own culture, rivalries, and defining eras, the questions aim to reflect that identity while keeping the gameplay fast and competitive. The result is a short, repeatable session that strengthens recall and helps you recognize names, seasons, and turning points with confidence.`;
    const p2 = `The ${input.category} angle matters because it sets expectations: supporters want clarity on what kind of knowledge they are testing. Some quizzes emphasize iconic players, others revolve around historic fixtures, tactical shifts, or the statistics that define a competition. Here, the difficulty is set to ${input.difficulty}, so the question design balances accessibility with detail. You should expect prompts that reward real football understanding—knowing why a moment is remembered, how a team’s identity evolved, and how records connect to specific seasons, managers, or style changes.`;
    const p3 = `A good football trivia experience also needs a clear keyword and topic map. For this quiz, the supporting keyword cluster includes: ${keywordLine}. Those phrases reflect how fans explore the subject—by club legacy, competition context, famous matchdays, key performers, and the small details that separate casual knowledge from deep understanding. By practicing with targeted prompts, you build stronger mental links between events and outcomes, making it easier to recall the right names under time pressure.`;
    const p4 = `Football knowledge improves fastest when you learn in patterns. Instead of memorizing isolated facts, you start to group information: an era of dominance, a tactical trend, a run of decisive matches, or a sequence of record-breaking performances. This is why quiz formats work so well for match preparation. Each round helps you revisit the same theme from different angles—goals, assists, managers, formations, and turning points—so your brain learns the connections. Over time, that makes football conversations, predictions, and match analysis feel more natural.`;
    const p5 = `If you replay this quiz, treat it like training. On the first attempt, focus on speed and gut instinct. On the second attempt, pay attention to the details you missed and the fun facts attached to each option. Those one-sentence notes are there to add context and help the information stick, the same way a highlight clip becomes memorable when you understand the circumstances behind it. This approach works especially well across ${input.league}, where narratives can be shaped by a single derby, a late-season run, or one legendary performance.`;
    const p6 = `When you are ready, start the quiz and aim for consistent improvement. A strong football quiz is not only entertainment; it is a compact way to refine your recall and deepen your understanding of the game. Whether your goal is to master a specific club story, revisit classic moments, or build a broader football vocabulary, short sessions add up. Explore related quizzes after you finish and keep your football IQ sharp by returning to this topic until the key names, seasons, and match moments feel automatic.`;

    return [p1, p2, p3, p4, p5, p6].join("\n\n");
}

function extractJson(text: string): string {
    const trimmed = text.trim();
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1);
    }
    const firstBracket = trimmed.indexOf("[");
    const lastBracket = trimmed.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return trimmed.slice(firstBracket, lastBracket + 1);
    }
    return trimmed;
}

async function generateFullWithOpenAI(
    topic: string,
    opts: { category?: string; difficulty?: string }
): Promise<GeneratedFullQuizResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const system =
        "You are a football (soccer) content generator. Output must be valid JSON only. No markdown. No commentary.";

    const categoryHint = opts.category ? `Category hint: ${opts.category}. ` : "";
    const difficultyHint = opts.difficulty ? `Difficulty hint: ${opts.difficulty}. ` : "";

    const user =
        `Create a football quiz page about: ${topic}. ` +
        categoryHint +
        difficultyHint +
        "Return ONLY valid JSON with this exact shape: " +
        "{ \"slug\": string, \"title\": string, \"league\": string, \"category\": string, \"difficulty\": string, \"seoDescription\": string, \"seoKeywords\": [string,...], \"seoContent\": string, \"pointsPerCorrect\": number, \"timeSeconds\": 15, \"questions\": Array<{ \"question\": string, \"options\": [ {\"text\": string, \"funFact\": string}, {\"text\": string, \"funFact\": string}, {\"text\": string, \"funFact\": string}, {\"text\": string, \"funFact\": string} ], \"correctIndex\": 0|1|2|3 }> }. " +
        "Rules: exactly 10 questions; each has 4 options; each option has a short funFact (1 sentence). " +
        "seoDescription must be 1-2 sentences and at least 60 characters. " +
        "seoKeywords must be 10-18 unique keywords/phrases relevant to this topic. " +
        "seoContent must be a single string of 450-650 words, written like an SEO article (no headings, no markdown), football-only. " +
        "league must be a real league/competition/national team context relevant to the topic. " +
        "category must be one of: Leagues, Legends, Nostalgia, Tactics, Nations, Derbies, Records, Tournaments. " +
        "difficulty must be one of: Easy, Medium, Hard. " +
        "pointsPerCorrect should be 10, 15, or 20 depending on difficulty.";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user },
            ],
            temperature: 0.7,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI error: ${res.status} ${text}`);
    }

    const data: any = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty content");

    const parsed = JSON.parse(extractJson(content));
    return normalizeFull(parsed, topic, opts);
}

async function generateFullWithGemini(
    topic: string,
    opts: { category?: string; difficulty?: string }
): Promise<GeneratedFullQuizResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash-latest";

    const system =
        "Only talk about football (soccer) and respond in a professional tone. Return only valid JSON, no markdown.";

    const categoryHint = opts.category ? `Category hint: ${opts.category}. ` : "";
    const difficultyHint = opts.difficulty ? `Difficulty hint: ${opts.difficulty}. ` : "";

    const prompt =
        `Create a football quiz page about: ${topic}. ` +
        categoryHint +
        difficultyHint +
        "Return ONLY valid JSON with this exact shape: " +
        "{ \"slug\": string, \"title\": string, \"league\": string, \"category\": string, \"difficulty\": string, \"seoDescription\": string, \"seoKeywords\": [string,...], \"seoContent\": string, \"pointsPerCorrect\": number, \"timeSeconds\": 15, \"questions\": Array<{ \"question\": string, \"options\": [ {\"text\": string, \"funFact\": string}, {\"text\": string, \"funFact\": string}, {\"text\": string, \"funFact\": string}, {\"text\": string, \"funFact\": string} ], \"correctIndex\": 0|1|2|3 }> }. " +
        "Rules: exactly 10 questions; each has 4 options; each option has a short funFact (1 sentence). " +
        "seoDescription must be 1-2 sentences and at least 60 characters. " +
        "seoKeywords must be 10-18 unique keywords/phrases relevant to this topic. " +
        "seoContent must be a single string of 450-650 words, written like an SEO article (no headings, no markdown), football-only. " +
        "league must be a real league/competition/national team context relevant to the topic. " +
        "category must be one of: Leagues, Legends, Nostalgia, Tactics, Nations, Derbies, Records, Tournaments. " +
        "difficulty must be one of: Easy, Medium, Hard. " +
        "pointsPerCorrect should be 10, 15, or 20 depending on difficulty.";


    const content = await geminiGenerateText({
        apiKey,
        model,
        promptText: `${system}\n\n${prompt}`,
        temperature: 0.7,
    });

    const parsed = JSON.parse(extractJson(content));
    return normalizeFull(parsed, topic, opts);
}

function normalizeQuestions(raw: unknown, topic: string): GeneratedQuizResponse {
    const fallback = (q: any): GeneratedQuizQuestion => {
        const options = Array.isArray(q?.options) ? q.options : Array.isArray(q?.choices) ? q.choices : [];
        const correctIndex = typeof q?.correctIndex === "number" ? q.correctIndex : typeof q?.answerIndex === "number" ? q.answerIndex : -1;
        return {
            question: String(q?.question ?? q?.prompt ?? ""),
            options: options.map((o: any) => String(o)).slice(0, 4),
            correctIndex,
            didYouKnow: String(q?.didYouKnow ?? q?.fact ?? q?.explanation ?? ""),
        };
    };

    const obj = raw as any;

    const questionsRaw = Array.isArray(obj)
        ? obj
        : Array.isArray(obj?.questions)
            ? obj.questions
            : Array.isArray(obj?.items)
                ? obj.items
                : [];

    const questions = questionsRaw.map(fallback).filter((q: GeneratedQuizQuestion) => {
        return (
            q.question.length > 0 &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            Number.isInteger(q.correctIndex) &&
            q.correctIndex >= 0 &&
            q.correctIndex < 4 &&
            q.didYouKnow.length > 0
        );
    });

    if (questions.length < 10) {
        throw new Error("Model returned invalid quiz JSON.");
    }

    return { topic, timeSeconds: 15, questions: questions.slice(0, 10) };
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80);
}

function normalizeFull(raw: unknown, topic: string, fallback: { category?: string; difficulty?: string }): GeneratedFullQuizResponse {
    const obj = raw as any;

    const title = String(obj?.title ?? topic).trim();
    const league = String(obj?.league ?? "").trim();
    const category = String(obj?.category ?? fallback.category ?? "Leagues").trim();
    const difficulty = String(obj?.difficulty ?? fallback.difficulty ?? "Medium").trim();
    const seoDescription = String(obj?.seoDescription ?? "").trim();
    let seoContent = String(obj?.seoContent ?? "").trim();
    const seoKeywords = Array.isArray(obj?.seoKeywords)
        ? obj.seoKeywords.map((v: any) => String(v).trim()).filter(Boolean)
        : [];
    const pointsPerCorrect = typeof obj?.pointsPerCorrect === "number" ? obj.pointsPerCorrect : 15;
    const timeSeconds = typeof obj?.timeSeconds === "number" ? obj.timeSeconds : 15;

    const slug = slugify(String(obj?.slug ?? title));

    const questionsRaw = Array.isArray(obj?.questions) ? obj.questions : [];
    const questions: GeneratedFullQuizQuestion[] = questionsRaw
        .map((q: any) => {
            const optionsRaw = Array.isArray(q?.options) ? q.options : [];
            const options = optionsRaw
                .map((o: any) => ({
                    text: String(o?.text ?? o?.option ?? "").trim(),
                    funFact: String(o?.funFact ?? o?.didYouKnow ?? o?.fact ?? "").trim(),
                }))
                .slice(0, 4);

            return {
                question: String(q?.question ?? q?.prompt ?? "").trim(),
                options: options as any,
                correctIndex: Number(q?.correctIndex) as any,
            };
        })
        .filter((q: any) => {
            return (
                q.question?.length > 0 &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                q.options.every((o: any) => o?.text?.length > 0 && o?.funFact?.length > 0) &&
                Number.isInteger(q.correctIndex) &&
                q.correctIndex >= 0 &&
                q.correctIndex < 4
            );
        })
        .slice(0, 10) as any;

    if (!slug || !title || !league || !category || !difficulty) {
        throw new Error("Model returned invalid full quiz JSON.");
    }

    if (!seoDescription || seoDescription.length < 50) {
        throw new Error("Model returned invalid seoDescription.");
    }

    const derivedKeywords = uniqueKeywords([
        ...seoKeywords,
        league,
        category,
        difficulty,
        ...titleKeywords(title),
        ...slug.split("-").filter((w) => w.length >= 4),
        "football quiz",
        "football trivia",
        "football knowledge",
        "quiz questions",
        "football history",
    ]);

    if (!seoContent || wordCount(seoContent) < 450) {
        const extra = buildSeoFallbackText({
            title,
            league,
            category,
            difficulty,
            keywords: derivedKeywords,
        });
        seoContent = [seoContent, extra].filter(Boolean).join("\n\n").trim();
    }

    if (!seoContent || wordCount(seoContent) < 450) {
        throw new Error("Model returned invalid seoContent (must be 450+ words).");
    }

    if (seoKeywords.length < 8) {
        throw new Error("Model returned invalid seoKeywords.");
    }

    if (questions.length < 10) {
        throw new Error("Model returned invalid questions for full quiz JSON.");
    }

    return {
        slug,
        title,
        league,
        category,
        difficulty,
        seoDescription,
        seoKeywords: seoKeywords.slice(0, 18),
        seoContent,
        pointsPerCorrect,
        timeSeconds,
        questions,
    };
}

async function generateWithOpenAI(topic: string): Promise<GeneratedQuizResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const system =
        "You are a quiz generator. Only talk about football (soccer) and respond in a professional tone.";

    const user =
        `Generate a football quiz about: ${topic}. ` +
        "Return ONLY valid JSON with this exact shape: { \"topic\": string, \"questions\": Array<{ \"question\": string, \"options\": [string,string,string,string], \"correctIndex\": 0|1|2|3, \"didYouKnow\": string }> }. " +
        "Rules: exactly 10 questions; 4 options each; do not include markdown; do not include extra keys; all content must be football-only.";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user },
            ],
            temperature: 0.7,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI error: ${res.status} ${text}`);
    }

    const data: any = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty content");

    const parsed = JSON.parse(extractJson(content));
    return normalizeQuestions(parsed, topic);
}

async function generateWithGemini(topic: string): Promise<GeneratedQuizResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash-latest";

    const system =
        "Only talk about football (soccer) and respond in a professional tone. Return only valid JSON, no markdown.";

    const prompt =
        `Generate a football quiz about: ${topic}. ` +
        "Return ONLY valid JSON with this exact shape: { \"topic\": string, \"questions\": Array<{ \"question\": string, \"options\": [string,string,string,string], \"correctIndex\": 0|1|2|3, \"didYouKnow\": string }> }. " +
        "Rules: exactly 10 questions; 4 options each; do not include markdown; do not include extra keys; all content must be football-only.";


    const content = await geminiGenerateText({
        apiKey,
        model,
        promptText: `${system}\n\n${prompt}`,
        temperature: 0.7,
    });

    const parsed = JSON.parse(extractJson(content));
    return normalizeQuestions(parsed, topic);
}

async function geminiGenerateText({
    apiKey,
    model,
    promptText,
    temperature,
}: {
    apiKey: string;
    model: string;
    promptText: string;
    temperature: number;
}): Promise<string> {
    const modelCandidates = Array.from(
        new Set([
            model,
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.0-pro",
        ])
    ).filter(Boolean);

    const versions = ["v1", "v1beta"] as const;
    let lastError = "";

    for (const m of modelCandidates) {
        for (const v of versions) {
            const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: promptText }] }],
                    generationConfig: { temperature },
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                lastError = `Gemini error (${m}, ${v}): ${res.status} ${text}`;
                if (res.status === 404) {
                    continue;
                }
                throw new Error(lastError);
            }

            const data: any = await res.json();
            const content: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                lastError = `Gemini returned empty content (${m}, ${v})`;
                continue;
            }
            return content;
        }
    }

    throw new Error(lastError || "Gemini error: model not found");
}

export async function POST(req: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin.ok) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
        const mode = typeof body?.mode === "string" ? body.mode.trim() : "";
        const category = typeof body?.category === "string" ? body.category.trim() : undefined;
        const difficulty = typeof body?.difficulty === "string" ? body.difficulty.trim() : undefined;

        if (!topic) {
            return Response.json({ error: "Missing 'topic'" }, { status: 400 });
        }

        const filter = aiFilter(topic);
        if (!filter.ok) {
            return Response.json({ error: filter.error }, { status: 400 });
        }

        const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
        const hasGemini = Boolean(process.env.GEMINI_API_KEY);

        if (!hasOpenAI && !hasGemini) {
            return Response.json(
                { error: "Missing AI provider key. Set OPENAI_API_KEY or GEMINI_API_KEY." },
                { status: 500 }
            );
        }

        if (mode === "full") {
            const result = hasOpenAI
                ? await generateFullWithOpenAI(topic, { category, difficulty })
                : await generateFullWithGemini(topic, { category, difficulty });
            return Response.json(result);
        }

        const result = hasOpenAI ? await generateWithOpenAI(topic) : await generateWithGemini(topic);
        return Response.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ error: message }, { status: 500 });
    }
}

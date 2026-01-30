import { requireAdmin } from "@/lib/admin";

async function listModels(apiKey: string, version: "v1" | "v1beta") {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();

    if (!res.ok) {
        throw new Error(`Gemini listModels error (${version}): ${res.status} ${text}`);
    }

    const json: any = JSON.parse(text);
    const models: string[] = Array.isArray(json?.models)
        ? json.models
            .map((m: any) => (typeof m?.name === "string" ? m.name : ""))
            .filter(Boolean)
        : [];

    return models;
}

export async function GET() {
    try {
        const admin = await requireAdmin();
        if (!admin.ok) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return Response.json({ error: "GEMINI_API_KEY is missing" }, { status: 500 });
        }

        const [v1, v1beta] = await Promise.all([
            listModels(apiKey, "v1").catch((e) => ({ error: e instanceof Error ? e.message : String(e) })),
            listModels(apiKey, "v1beta").catch((e) => ({ error: e instanceof Error ? e.message : String(e) })),
        ]);

        return Response.json({ ok: true, v1, v1beta });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ error: message }, { status: 500 });
    }
}

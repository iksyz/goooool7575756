import { aiFilter } from "@/lib/ai/aiFilter";

export type FootballOnlyGuardResult =
    | { ok: true }
    | { ok: false; reason: string };

export function footballOnlyGuard(input: string): FootballOnlyGuardResult {
    const res = aiFilter(input, "Only football-related requests are allowed.");
    if (!res.ok) return { ok: false, reason: res.error };
    return { ok: true };
}

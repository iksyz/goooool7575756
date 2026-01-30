export type AIFilterResult =
    | { ok: true }
    | { ok: false; error: string };

const DEFAULT_FOUL_MESSAGE = "This is a foul! We only talk football here.";

export function aiFilter(input: string, foulMessage: string = DEFAULT_FOUL_MESSAGE): AIFilterResult {
    const text = (input ?? "").toLowerCase().trim();

    if (!text) {
        return { ok: false, error: foulMessage };
    }

    const footballKeywords = [
        "football",
        "soccer",
        "uefa",
        "fifa",
        "ucl",
        "uel",
        "epl",
        "derby",
        "derbies",
        "england",
        "spain",
        "france",
        "germany",
        "italy",
        "portugal",
        "brazil",
        "argentina",
        "netherlands",
        "belgium",
        "croatia",
        "turkey",
        "türkiye",
        "international",
        "euros",
        "euro ",
        "copa",
        "qualifier",
        "qualifiers",
        "top scorer",
        "top scorers",
        "goalscorer",
        "goal scorer",
        "goal scorers",
        "scorer",
        "scorers",
        "golden boot",
        "ballon d'or",
        "player of the year",
        "super lig",
        "süper lig",
        "turkish super league",
        "real madrid",
        "realmadrid",
        "barcelona",
        "fc barcelona",
        "el clasico",
        "galatasaray",
        "fenerbahce",
        "fenerbahçe",
        "besiktas",
        "beşiktaş",
        "trabzonspor",
        "u21",
        "u19",
        "afcon",
        "copa america",
        "copa libertadores",
        "champions league",
        "europa league",
        "conference league",
        "club world cup",
        "premier league",
        "la liga",
        "serie a",
        "bundesliga",
        "ligue 1",
        "mls",
        "world cup",
        "goal",
        "penalty",
        "offside",
        "match",
        "fixture",
        "player",
        "coach",
        "manager",
        "stadium",
        "ball",
        "referee",
        "var",
        "transfer",
        "tactics",
        "pressing",
        "formation",
        "xg",
        "expected goals",
    ];

    const hasFootballSignal = footballKeywords.some((k) => text.includes(k));

    if (!hasFootballSignal) {
        return { ok: false, error: foulMessage };
    }

    return { ok: true };
}

export function assertFootballOnly(input: string, foulMessage: string = DEFAULT_FOUL_MESSAGE) {
    const res = aiFilter(input, foulMessage);
    if (!res.ok) {
        throw new Error(res.error);
    }
}

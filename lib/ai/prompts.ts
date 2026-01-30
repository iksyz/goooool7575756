export type QuizDifficulty = "Easy" | "Medium" | "Hard";

type QuizPromptInput = {
    topic: string;
    difficulty: QuizDifficulty;
    category: string;
};

export const FOOTBALL_ONLY_SYSTEM_PROMPT =
    "Only talk about football (soccer) and respond in a professional tone.";

export function buildQuizGenerationPrompt({ topic, difficulty, category }: QuizPromptInput) {
    return (
        `${FOOTBALL_ONLY_SYSTEM_PROMPT}\n\n` +
        `Generate a football quiz about: ${topic}.\n` +
        `Difficulty: ${difficulty}.\n` +
        `Football category: ${category}.\n\n` +
        "Return ONLY valid JSON. No markdown. No extra keys. The JSON must follow this schema exactly:\n" +
        "{\n" +
        "  \"slug\": string,\n" +
        "  \"title\": string,\n" +
        "  \"league\": string,\n" +
        "  \"category\": string,\n" +
        "  \"difficulty\": \"Easy\"|\"Medium\"|\"Hard\",\n" +
        "  \"seoDescription\": string,\n" +
        "  \"pointsPerCorrect\": number,\n" +
        "  \"questions\": [\n" +
        "    {\n" +
        "      \"question\": string,\n" +
        "      \"options\": [\n" +
        "        { \"text\": string, \"funFact\": string },\n" +
        "        { \"text\": string, \"funFact\": string },\n" +
        "        { \"text\": string, \"funFact\": string },\n" +
        "        { \"text\": string, \"funFact\": string }\n" +
        "      ],\n" +
        "      \"correctIndex\": 0|1|2|3\n" +
        "    }\n" +
        "  ]\n" +
        "}\n\n" +
        "Rules:\n" +
        "- Exactly 10 questions\n" +
        "- Each question has exactly 4 options\n" +
        "- Each option includes a short football-only fun fact (the text shown after selecting that option)\n" +
        "- seoDescription must be written for SEO (football keywords: football, quiz, trivia, league, players, clubs, history, tactics)\n" +
        "- slug must be SEO-friendly (lowercase, hyphens, no special characters)\n"
    );
}

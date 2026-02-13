/**
 * Database abstraction layer
 * 
 * Cloudflare D1 kullanımına geçiş için hazırlık.
 * Şu anda mock data döndürüyor, ileride D1 binding ile değiştirilecek.
 */

export type User = {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    totalPoints: number;
    weeklyPoints: number;
    monthlyPoints: number;
    level: string;
    completedQuizzes: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type QuizSubmission = {
    id: string;
    userId: string;
    quizSlug: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    createdAt: Date;
};

/**
 * Cloudflare D1 bağlantısı
 * Workers ortamında env.DB üzerinden erişilecek
 */
export function getDb() {
    // Cloudflare Workers ortamında:
    // return env.DB
    
    // Şimdilik mock
    return null;
}

/**
 * Kullanıcı profili getir
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    const db = getDb();
    
    if (!db) {
        // Mock data - Cloudflare D1 aktif olmadığı için
        return {
            id: "mock-user-id",
            email,
            name: null,
            image: null,
            totalPoints: 0,
            weeklyPoints: 0,
            monthlyPoints: 0,
            level: "Amateur",
            completedQuizzes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    
    // Cloudflare D1 query
    // const result = await db.prepare(
    //     "SELECT * FROM users WHERE email = ?"
    // ).bind(email).first();
    
    // return result as User | null;
    return null;
}

/**
 * Kullanıcı oluştur veya güncelle (OAuth için)
 */
export async function upsertUser(data: {
    email: string;
    name?: string;
    image?: string;
}): Promise<User> {
    const db = getDb();
    
    if (!db) {
        // Mock - gerçek DB olmadığı için sadece data döndür
        return {
            id: "mock-user-id",
            email: data.email,
            name: data.name ?? null,
            image: data.image ?? null,
            totalPoints: 0,
            weeklyPoints: 0,
            monthlyPoints: 0,
            level: "Amateur",
            completedQuizzes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    
    // Cloudflare D1 upsert
    // await db.prepare(`
    //     INSERT INTO users (email, name, image, updatedAt)
    //     VALUES (?, ?, ?, datetime('now'))
    //     ON CONFLICT(email) DO UPDATE SET
    //         name = excluded.name,
    //         image = excluded.image,
    //         updatedAt = datetime('now')
    // `).bind(data.email, data.name, data.image).run();
    
    // return await getUserByEmail(data.email) as User;
    return {} as User;
}

/**
 * Leaderboard - top 50
 */
export async function getLeaderboard(scope: "all" | "weekly" | "monthly" = "all"): Promise<User[]> {
    const db = getDb();
    
    if (!db) {
        // Mock - boş array
        return [];
    }
    
    // Cloudflare D1 query
    // const orderBy = scope === "weekly" 
    //     ? "weeklyPoints DESC" 
    //     : scope === "monthly" 
    //         ? "monthlyPoints DESC" 
    //         : "totalPoints DESC";
    
    // const results = await db.prepare(`
    //     SELECT * FROM users
    //     ORDER BY ${orderBy}, createdAt ASC
    //     LIMIT 50
    // `).all();
    
    // return results.results as User[];
    return [];
}

/**
 * Quiz sonucu kaydet
 */
export async function submitQuiz(data: {
    userId: string;
    quizSlug: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
}): Promise<void> {
    const db = getDb();
    
    if (!db) {
        // Mock - hiçbir şey yapma
        return;
    }
    
    // Cloudflare D1 insert
    // await db.prepare(`
    //     INSERT INTO quiz_submissions (userId, quizSlug, score, totalQuestions, timeSpent, createdAt)
    //     VALUES (?, ?, ?, ?, ?, datetime('now'))
    // `).bind(data.userId, data.quizSlug, data.score, data.totalQuestions, data.timeSpent).run();
    
    // Kullanıcının puanını güncelle
    // const points = Math.floor((data.score / data.totalQuestions) * 100);
    // await db.prepare(`
    //     UPDATE users
    //     SET totalPoints = totalPoints + ?,
    //         weeklyPoints = weeklyPoints + ?,
    //         monthlyPoints = monthlyPoints + ?
    //     WHERE id = ?
    // `).bind(points, points, points, data.userId).run();
}

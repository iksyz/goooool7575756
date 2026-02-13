/**
 * Database abstraction layer
 * 
 * Cloudflare D1 database ile çalışır.
 */

// D1Database type definition for TypeScript
type D1Database = any; // OpenNext Cloudflare runtime type

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
 * OpenNext Cloudflare ortamında env.DB üzerinden erişilir
 */
export function getDb(): D1Database | null {
    try {
        // @ts-ignore - OpenNext Cloudflare environment
        if (typeof process !== 'undefined' && process.env?.DB) {
            // @ts-ignore
            return process.env.DB as D1Database;
        }
    } catch (e) {
        console.warn("⚠️ D1 binding not available, using mock mode");
    }
    return null;
}

/**
 * Kullanıcı profili getir
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    const db = getDb();
    
    if (!db) {
        console.log("📊 getUserByEmail (mock): Returning default user for", email);
        return {
            id: `mock-${Buffer.from(email).toString('base64').slice(0, 16)}`,
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
    
    try {
        const result = await db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).bind(email).first();
        
        if (!result) return null;
        
        return {
            id: result.id as string,
            email: result.email as string,
            name: result.name as string | null,
            image: result.image as string | null,
            totalPoints: (result.totalPoints as number) || 0,
            weeklyPoints: (result.weeklyPoints as number) || 0,
            monthlyPoints: (result.monthlyPoints as number) || 0,
            level: (result.level as string) || "Amateur",
            completedQuizzes: JSON.parse((result.completedQuizzes as string) || '[]'),
            createdAt: new Date(result.createdAt as string),
            updatedAt: new Date(result.updatedAt as string),
        };
    } catch (error) {
        console.error("❌ getUserByEmail D1 error:", error);
        return null;
    }
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
        console.log("📊 upsertUser (mock):", data.email);
        return {
            id: `mock-${Buffer.from(data.email).toString('base64').slice(0, 16)}`,
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
    
    try {
        await db.prepare(`
            INSERT INTO users (email, name, image, updatedAt)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(email) DO UPDATE SET
                name = excluded.name,
                image = excluded.image,
                updatedAt = datetime('now')
        `).bind(data.email, data.name ?? null, data.image ?? null).run();
        
        const user = await getUserByEmail(data.email);
        if (!user) throw new Error("Failed to create/update user");
        return user;
    } catch (error) {
        console.error("❌ upsertUser D1 error:", error);
        throw error;
    }
}

/**
 * Leaderboard - top 50
 */
export async function getLeaderboard(scope: "all" | "weekly" | "monthly" = "all"): Promise<User[]> {
    const db = getDb();
    
    if (!db) {
        console.log("📊 getLeaderboard (mock): Empty leaderboard");
        return [];
    }
    
    try {
        const orderBy = scope === "weekly" 
            ? "weeklyPoints DESC" 
            : scope === "monthly" 
                ? "monthlyPoints DESC" 
                : "totalPoints DESC";
        
        const results = await db.prepare(`
            SELECT * FROM users
            ORDER BY ${orderBy}, createdAt ASC
            LIMIT 50
        `).all();
        
        return (results.results || []).map((row: any) => ({
            id: row.id,
            email: row.email,
            name: row.name,
            image: row.image,
            totalPoints: row.totalPoints || 0,
            weeklyPoints: row.weeklyPoints || 0,
            monthlyPoints: row.monthlyPoints || 0,
            level: row.level || "Amateur",
            completedQuizzes: JSON.parse(row.completedQuizzes || '[]'),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
        }));
    } catch (error) {
        console.error("❌ getLeaderboard D1 error:", error);
        return [];
    }
}

/**
 * Quiz sonucu kaydet ve kullanıcı puanını güncelle
 */
export async function submitQuiz(data: {
    userId: string;
    quizSlug: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
}): Promise<void> {
    const db = getDb();
    
    const points = Math.floor((data.score / data.totalQuestions) * 100);
    
    if (!db) {
        console.log(`📝 submitQuiz (mock): ${data.quizSlug}, score: ${data.score}/${data.totalQuestions}, points: ${points}`);
        return;
    }
    
    try {
        // Quiz submission kaydet
        await db.prepare(`
            INSERT INTO quiz_submissions (userId, quizSlug, score, totalQuestions, timeSpent, createdAt)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(data.userId, data.quizSlug, data.score, data.totalQuestions, data.timeSpent).run();
        
        // Kullanıcının puanını güncelle
        await db.prepare(`
            UPDATE users
            SET totalPoints = totalPoints + ?,
                weeklyPoints = weeklyPoints + ?,
                monthlyPoints = monthlyPoints + ?,
                updatedAt = datetime('now')
            WHERE id = ?
        `).bind(points, points, points, data.userId).run();
        
        // Completed quizzes listesini güncelle
        const user = await db.prepare(`SELECT completedQuizzes FROM users WHERE id = ?`).bind(data.userId).first();
        if (user) {
            const completed = JSON.parse((user.completedQuizzes as string) || '[]');
            if (!completed.includes(data.quizSlug)) {
                completed.push(data.quizSlug);
                await db.prepare(`UPDATE users SET completedQuizzes = ? WHERE id = ?`).bind(JSON.stringify(completed), data.userId).run();
            }
        }
        
        console.log(`✅ Quiz submitted: ${data.quizSlug}, user: ${data.userId}, points: ${points}`);
    } catch (error) {
        console.error("❌ submitQuiz D1 error:", error);
        throw error;
    }
}

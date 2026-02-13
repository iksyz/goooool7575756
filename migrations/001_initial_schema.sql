-- Cloudflare D1 Initial Schema
-- Run this with: wrangler d1 execute <DATABASE_NAME> --file=./migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    totalPoints INTEGER DEFAULT 0,
    weeklyPoints INTEGER DEFAULT 0,
    monthlyPoints INTEGER DEFAULT 0,
    level TEXT DEFAULT 'Amateur',
    completedQuizzes TEXT DEFAULT '[]', -- JSON array as string
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_totalPoints ON users(totalPoints DESC);
CREATE INDEX IF NOT EXISTS idx_users_weeklyPoints ON users(weeklyPoints DESC);
CREATE INDEX IF NOT EXISTS idx_users_monthlyPoints ON users(monthlyPoints DESC);

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    userId TEXT NOT NULL,
    quizSlug TEXT NOT NULL,
    score INTEGER NOT NULL,
    totalQuestions INTEGER NOT NULL,
    timeSpent INTEGER NOT NULL, -- seconds
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_submissions_userId ON quiz_submissions(userId);
CREATE INDEX IF NOT EXISTS idx_submissions_quizSlug ON quiz_submissions(quizSlug);
CREATE INDEX IF NOT EXISTS idx_submissions_createdAt ON quiz_submissions(createdAt DESC);

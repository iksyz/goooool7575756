-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "weeklyPoints" INTEGER NOT NULL DEFAULT 0,
    "weeklyKey" TEXT NOT NULL DEFAULT '',
    "monthlyPoints" INTEGER NOT NULL DEFAULT 0,
    "monthlyKey" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT 'Amateur',
    "completedQuizzes" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("completedQuizzes", "createdAt", "email", "emailVerified", "id", "image", "level", "name", "totalPoints", "updatedAt") SELECT "completedQuizzes", "createdAt", "email", "emailVerified", "id", "image", "level", "name", "totalPoints", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

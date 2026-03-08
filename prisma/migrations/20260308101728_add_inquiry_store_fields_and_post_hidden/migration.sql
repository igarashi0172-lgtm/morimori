-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "storeAddress" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "storeArea" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "storeClosedDays" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "storeDesc" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "storeGenre" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "storeHours" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "storeImageUrl" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "storePhone" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "storeStation" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "mediaUrls" TEXT NOT NULL DEFAULT '[]',
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Post_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("body", "createdAt", "id", "isCompleted", "mediaType", "mediaUrls", "storeId", "title", "updatedAt", "userId") SELECT "body", "createdAt", "id", "isCompleted", "mediaType", "mediaUrls", "storeId", "title", "updatedAt", "userId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "submittedById" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "nearestStation" TEXT,
    "genre" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "phone" TEXT,
    "hours" TEXT,
    "closedDays" TEXT,
    "submittedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Store_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Store" ("address", "area", "closedDays", "createdAt", "description", "genre", "hours", "id", "imageUrl", "name", "nearestStation", "phone", "updatedAt") SELECT "address", "area", "closedDays", "createdAt", "description", "genre", "hours", "id", "imageUrl", "name", "nearestStation", "phone", "updatedAt" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "positioning" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "contentStyle" TEXT NOT NULL,
    "bannedWords" TEXT NOT NULL DEFAULT '',
    "commonTags" TEXT NOT NULL DEFAULT '',
    "productInfo" TEXT NOT NULL DEFAULT '',
    "referralLink" TEXT NOT NULL DEFAULT '',
    "adIntensity" TEXT NOT NULL DEFAULT '中',
    "allowMarketing" BOOLEAN NOT NULL DEFAULT false,
    "defaultLength" TEXT NOT NULL DEFAULT '中',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "referenceContent" TEXT NOT NULL DEFAULT '',
    "productHook" TEXT NOT NULL DEFAULT '',
    "contentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '未生成',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "profileId" TEXT,
    CONSTRAINT "Topic_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titles" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyNoEmoji" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL,
    "coverText" TEXT NOT NULL DEFAULT '',
    "coverImagePrompt" TEXT NOT NULL DEFAULT '',
    "coverImageUrl" TEXT NOT NULL DEFAULT '',
    "contentImagePrompts" TEXT NOT NULL DEFAULT '[]',
    "contentImageUrls" TEXT NOT NULL DEFAULT '[]',
    "commentGuide" TEXT NOT NULL DEFAULT '',
    "complianceWarnings" TEXT NOT NULL DEFAULT '[]',
    "publishChecklist" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "scheduledDate" TEXT NOT NULL DEFAULT '',
    "scheduledTime" TEXT NOT NULL DEFAULT '',
    "publishLink" TEXT NOT NULL DEFAULT '',
    "publishNote" TEXT NOT NULL DEFAULT '',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "profileId" TEXT,
    "topicId" TEXT,
    CONSTRAINT "Draft_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Draft_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "localPath" TEXT NOT NULL DEFAULT '',
    "width" INTEGER NOT NULL DEFAULT 1080,
    "height" INTEGER NOT NULL DEFAULT 1350,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draftId" TEXT NOT NULL,
    CONSTRAINT "GeneratedImage_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draftId" TEXT NOT NULL,
    CONSTRAINT "PublishSchedule_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aiBaseUrl" TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
    "aiApiKey" TEXT NOT NULL DEFAULT '',
    "textModel" TEXT NOT NULL DEFAULT 'gpt-4o',
    "imageModel" TEXT NOT NULL DEFAULT 'dall-e-3',
    "defaultCount" INTEGER NOT NULL DEFAULT 3,
    "localSavePath" TEXT NOT NULL DEFAULT './data/assets',
    "enableSensitiveCheck" BOOLEAN NOT NULL DEFAULT true,
    "enableAdCheck" BOOLEAN NOT NULL DEFAULT true,
    "officialApiAdapter" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GenerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMsg" TEXT NOT NULL DEFAULT '',
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

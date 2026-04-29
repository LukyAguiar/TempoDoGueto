-- CreateTable
CREATE TABLE "page_configs" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'barber',
    "primaryColor" TEXT NOT NULL DEFAULT '#f6b914',
    "accentColor" TEXT NOT NULL DEFAULT '#f6b914',
    "bgColor" TEXT NOT NULL DEFAULT '#0d0d0d',
    "cardBg" TEXT NOT NULL DEFAULT '#1a1a1a',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "buttonText" TEXT NOT NULL DEFAULT 'Agendar agora',
    "slogan" TEXT,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "bannerUrl" TEXT,
    "overlayOpacity" INTEGER NOT NULL DEFAULT 50,
    "sections" JSONB NOT NULL DEFAULT '["hero","services","team","gallery","location"]',
    "teamMembers" JSONB NOT NULL DEFAULT '[]',
    "gallery" JSONB NOT NULL DEFAULT '[]',
    "showPrices" BOOLEAN NOT NULL DEFAULT true,
    "showDuration" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_configs_businessId_key" ON "page_configs"("businessId");

-- AddForeignKey
ALTER TABLE "page_configs" ADD CONSTRAINT "page_configs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

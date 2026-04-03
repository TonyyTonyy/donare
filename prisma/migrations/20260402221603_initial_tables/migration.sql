-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('CLOTHING', 'CLOTHING_MALE', 'CLOTHING_FEMALE', 'CLOTHING_KIDS', 'SHOES', 'FURNITURE', 'FURNITURE_LIVING', 'FURNITURE_BEDROOM', 'FURNITURE_KITCHEN', 'ELECTRONICS', 'ELECTRONICS_IT', 'ELECTRONICS_HOME', 'ELECTRONICS_AUDIO', 'BOOKS', 'TOYS', 'SPORTS', 'KITCHEN', 'DECORATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RESERVED', 'DONATED', 'CANCELLED', 'EXPIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ProductPickupType" AS ENUM ('HOME', 'NEUTRAL_POINT', 'STORE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "cpf" TEXT,
    "showRealName" BOOLEAN NOT NULL DEFAULT true,
    "showStats" BOOLEAN NOT NULL DEFAULT true,
    "showLocation" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "currentActiveRequests" INTEGER NOT NULL DEFAULT 0,
    "maxSimultaneousRequests" INTEGER NOT NULL DEFAULT 3,
    "lastDonationReceivedAt" TIMESTAMP(3),
    "cooldownEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "condition" "ProductCondition" NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "images" TEXT[],
    "primaryImageIndex" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT,
    "brand" TEXT,
    "isWorking" BOOLEAN,
    "pickupType" "ProductPickupType" NOT NULL DEFAULT 'NEUTRAL_POINT',
    "pickupAddress" TEXT,
    "pickupCity" TEXT,
    "pickupLatitude" DOUBLE PRECISION,
    "pickupLongitude" DOUBLE PRECISION,
    "pickupInstructions" TEXT,
    "donorId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "reservedAt" TIMESTAMP(3),
    "donatedAt" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "products_donorId_idx" ON "products"("donorId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_pickupLatitude_pickupLongitude_idx" ON "products"("pickupLatitude", "pickupLongitude");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'BUSINESS');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL', 'PASSWORD');

-- CreateTable
CREATE TABLE "user" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_utc" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_utc" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT[],

    CONSTRAINT "user_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "user_verification" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unique_string" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "user_uuid" UUID NOT NULL,
    "created_utc" TIMESTAMP(6) NOT NULL,
    "expires_utc" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_verification_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_uuid" UUID NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "business_category_uuid" UUID,
    "country" TEXT,
    "state_and_province" TEXT,
    "city" TEXT,
    "street" TEXT,
    "postal_code" TEXT,
    "logo_url" TEXT,
    "phone_number" TEXT,
    "business_email" TEXT,
    "open_time" TEXT,
    "close_time" TEXT,
    "days_of_operation" TEXT[],
    "website_url" TEXT,
    "linkedin_url" TEXT,
    "instagram_url" TEXT,
    "twitter_url" TEXT,
    "facebook_url" TEXT,
    "created_utc" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_utc" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "business_categories" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT NOT NULL,
    "created_utc" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_utc" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_categories_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_verification_unique_string_key" ON "user_verification"("unique_string");

-- CreateIndex
CREATE INDEX "user_veriication_useruuid_idx" ON "user_verification"("user_uuid");

-- CreateIndex
CREATE INDEX "business_profile_userUuid_idx" ON "business_profiles"("user_uuid");

-- CreateIndex
CREATE INDEX "business_profile_country_idx" ON "business_profiles"("country");

-- CreateIndex
CREATE INDEX "business_profile_stateAndProvince_idx" ON "business_profiles"("state_and_province");

-- CreateIndex
CREATE INDEX "business_profile_city_idx" ON "business_profiles"("city");

-- CreateIndex
CREATE INDEX "business_profile_businessCategoryUuid_idx" ON "business_profiles"("business_category_uuid");

-- AddForeignKey
ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_business_category_uuid_fkey" FOREIGN KEY ("business_category_uuid") REFERENCES "business_categories"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

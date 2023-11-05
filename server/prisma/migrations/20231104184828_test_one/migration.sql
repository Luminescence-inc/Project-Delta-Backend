-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'BUSINESS');

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

    CONSTRAINT "user_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "user_verification" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unique_string" TEXT NOT NULL,
    "user_uuid" UUID NOT NULL,
    "created_utc" TIMESTAMP(6) NOT NULL,
    "expires_utc" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_verification_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_verification_unique_string_key" ON "user_verification"("unique_string");

-- AddForeignKey
ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

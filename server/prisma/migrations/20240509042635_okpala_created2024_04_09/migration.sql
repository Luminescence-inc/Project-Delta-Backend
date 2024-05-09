-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('VERIFY_EMAIL', 'CREATE_PROFILE');

-- CreateTable
CREATE TABLE "user_profile_reminder_logs" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_uuid" UUID NOT NULL,
    "created_utc" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_utc" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number_of_time_sent" INTEGER NOT NULL,
    "email_type" "EmailType" NOT NULL,

    CONSTRAINT "user_profile_reminder_logs_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "user_profile_reminder_logs_idx" ON "user_profile_reminder_logs"("user_uuid");

-- AddForeignKey
ALTER TABLE "user_profile_reminder_logs" ADD CONSTRAINT "user_profile_reminder_logs_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "user"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

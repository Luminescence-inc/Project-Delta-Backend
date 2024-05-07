/*
  Warnings:

  - A unique constraint covering the columns `[user_uuid]` on the table `user_profile_reminder_logs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_profile_reminder_logs_user_uuid_key" ON "user_profile_reminder_logs"("user_uuid");

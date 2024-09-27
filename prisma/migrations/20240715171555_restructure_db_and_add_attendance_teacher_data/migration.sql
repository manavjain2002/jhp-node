/*
  Warnings:

  - The primary key for the `course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `course` table. All the data in the column will be lost.
  - The primary key for the `master_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `master_role` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `master_role` table. All the data in the column will be lost.
  - The primary key for the `result` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `result` table. All the data in the column will be lost.
  - You are about to drop the column `registration_id` on the `result` table. All the data in the column will be lost.
  - You are about to drop the `user_apply_course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[student_apply_course_id]` on the table `result` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `created_by` on the `course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `organization_id` to the `master_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_apply_course_id` to the `result` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `course_passing_score` on the `result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `creator_id` on the `result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "course" DROP CONSTRAINT "course_created_by_fkey";

-- DropForeignKey
ALTER TABLE "result" DROP CONSTRAINT "result_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "result" DROP CONSTRAINT "result_registration_id_fkey";

-- DropForeignKey
ALTER TABLE "user_apply_course" DROP CONSTRAINT "user_apply_course_course_id_fkey";

-- DropForeignKey
ALTER TABLE "user_apply_course" DROP CONSTRAINT "user_apply_course_user_id_fkey";

-- DropIndex
DROP INDEX "result_id_idx";

-- DropIndex
DROP INDEX "result_registration_id_key";

-- AlterTable
ALTER TABLE "course" DROP CONSTRAINT "course_pkey",
DROP COLUMN "id",
ADD COLUMN     "course_id" SERIAL NOT NULL,
ALTER COLUMN "course_score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "course_passing_score" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "created_by",
ADD COLUMN     "created_by" INTEGER NOT NULL,
ADD CONSTRAINT "course_pkey" PRIMARY KEY ("course_id");

-- AlterTable
ALTER TABLE "master_role" DROP CONSTRAINT "master_role_pkey",
DROP COLUMN "id",
DROP COLUMN "org_id",
ADD COLUMN     "master_role_id" SERIAL NOT NULL,
ADD COLUMN     "organization_id" INTEGER NOT NULL,
ADD CONSTRAINT "master_role_pkey" PRIMARY KEY ("master_role_id");

-- AlterTable
ALTER TABLE "result" DROP CONSTRAINT "result_pkey",
DROP COLUMN "id",
DROP COLUMN "registration_id",
ADD COLUMN     "result_id" SERIAL NOT NULL,
ADD COLUMN     "student_apply_course_id" INTEGER NOT NULL,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "course_passing_score",
ADD COLUMN     "course_passing_score" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "course_score" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "creator_id",
ADD COLUMN     "creator_id" INTEGER NOT NULL,
ADD CONSTRAINT "result_pkey" PRIMARY KEY ("result_id");

-- DropTable
DROP TABLE "user_apply_course";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "organization" (
    "organization_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "student" (
    "student_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "father_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" "gender" NOT NULL,
    "username" TEXT NOT NULL,
    "reset_password_token" TEXT NOT NULL DEFAULT '',
    "reset_password_token_expiration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reset_email_token" TEXT NOT NULL DEFAULT '',
    "reset_email_token_expiration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "teacher" (
    "teacher_id" SERIAL NOT NULL,
    "teacher_first_name" TEXT NOT NULL,
    "teacher_last_name" TEXT NOT NULL,
    "teacher_phone_number" TEXT NOT NULL,
    "teacher_email" TEXT NOT NULL,
    "teacher_address" TEXT NOT NULL,
    "teacher_password" TEXT NOT NULL,
    "teacher_birth_date" TIMESTAMP(3) NOT NULL,
    "teacher_gender" "gender" NOT NULL,
    "teacher_reset_password_token" TEXT NOT NULL DEFAULT '',
    "teacher_reset_password_token_expiration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "teacher_student_assignes" (
    "teacher_student_assignes_id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_student_assignes_pkey" PRIMARY KEY ("teacher_student_assignes_id")
);

-- CreateTable
CREATE TABLE "student_apply_course" (
    "student_apply_course_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "student_apply_course_pkey" PRIMARY KEY ("student_apply_course_id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "attendance_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_phone_number_key" ON "organization"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "organization_email_key" ON "organization"("email");

-- CreateIndex
CREATE INDEX "organization_name_idx" ON "organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "student_username_key" ON "student"("username");

-- CreateIndex
CREATE INDEX "student_organization_id_idx" ON "student"("organization_id");

-- CreateIndex
CREATE INDEX "student_first_name_last_name_idx" ON "student"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "student_first_name_last_name_phone_number_idx" ON "student"("first_name", "last_name", "phone_number");

-- CreateIndex
CREATE INDEX "student_reset_email_token_idx" ON "student"("reset_email_token");

-- CreateIndex
CREATE INDEX "student_reset_email_token_reset_email_token_expiration_idx" ON "student"("reset_email_token", "reset_email_token_expiration");

-- CreateIndex
CREATE INDEX "student_reset_password_token_idx" ON "student"("reset_password_token");

-- CreateIndex
CREATE INDEX "student_reset_password_token_reset_password_token_expiratio_idx" ON "student"("reset_password_token", "reset_password_token_expiration");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_teacher_phone_number_key" ON "teacher"("teacher_phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_teacher_email_key" ON "teacher"("teacher_email");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_teacher_password_key" ON "teacher"("teacher_password");

-- CreateIndex
CREATE INDEX "teacher_organization_id_idx" ON "teacher"("organization_id");

-- CreateIndex
CREATE INDEX "teacher_teacher_first_name_teacher_last_name_idx" ON "teacher"("teacher_first_name", "teacher_last_name");

-- CreateIndex
CREATE INDEX "teacher_teacher_first_name_teacher_last_name_teacher_phone__idx" ON "teacher"("teacher_first_name", "teacher_last_name", "teacher_phone_number");

-- CreateIndex
CREATE INDEX "teacher_teacher_reset_password_token_idx" ON "teacher"("teacher_reset_password_token");

-- CreateIndex
CREATE INDEX "teacher_teacher_reset_password_token_teacher_reset_password_idx" ON "teacher"("teacher_reset_password_token", "teacher_reset_password_token_expiration");

-- CreateIndex
CREATE INDEX "student_apply_course_student_id_course_id_idx" ON "student_apply_course"("student_id", "course_id");

-- CreateIndex
CREATE INDEX "student_apply_course_student_id_idx" ON "student_apply_course"("student_id");

-- CreateIndex
CREATE INDEX "student_apply_course_course_id_idx" ON "student_apply_course"("course_id");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE INDEX "attendance_date_student_id_idx" ON "attendance"("date", "student_id");

-- CreateIndex
CREATE INDEX "attendance_date_teacher_id_student_id_idx" ON "attendance"("date", "teacher_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "result_student_apply_course_id_key" ON "result"("student_apply_course_id");

-- CreateIndex
CREATE INDEX "result_result_id_idx" ON "result"("result_id");

-- CreateIndex
CREATE INDEX "result_creator_id_idx" ON "result"("creator_id");

-- AddForeignKey
ALTER TABLE "master_role" ADD CONSTRAINT "master_role_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_student_assignes" ADD CONSTRAINT "teacher_student_assignes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_student_assignes" ADD CONSTRAINT "teacher_student_assignes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_apply_course" ADD CONSTRAINT "student_apply_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_apply_course" ADD CONSTRAINT "student_apply_course_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_student_apply_course_id_fkey" FOREIGN KEY ("student_apply_course_id") REFERENCES "student_apply_course"("student_apply_course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

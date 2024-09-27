/*
  Warnings:

  - You are about to drop the `teacher_student_assignes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[register_no]` on the table `student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacher_username]` on the table `teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `register_no` to the `student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_username` to the `teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teacher_student_assignes" DROP CONSTRAINT "teacher_student_assignes_student_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher_student_assignes" DROP CONSTRAINT "teacher_student_assignes_teacher_id_fkey";

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "assigned_to" INTEGER,
ADD COLUMN     "register_no" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "teacher" ADD COLUMN     "teacher_username" TEXT NOT NULL;

-- DropTable
DROP TABLE "teacher_student_assignes";

-- CreateIndex
CREATE UNIQUE INDEX "student_register_no_key" ON "student"("register_no");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_teacher_username_key" ON "teacher"("teacher_username");

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_assignedTo_fkey" FOREIGN KEY ("assigned_to") REFERENCES "teacher"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

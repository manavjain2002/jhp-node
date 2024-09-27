/*
  Warnings:

  - A unique constraint covering the columns `[date,student_id]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attendance_date_student_id_key" ON "attendance"("date", "student_id");

/*
  Warnings:

  - You are about to drop the `teacher_student_assignes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[register_no]` on the table `student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacher_username]` on the table `teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `register_no` to the `student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_username` to the `teacher` table without a default value. This is not possible if the table is not empty.

*/
-- Insert
INSERT INTO "organization"("name","location","phone_number","email") VALUES('jhp','Ahmedabad','9265983885','manavj4255@gmail.com');
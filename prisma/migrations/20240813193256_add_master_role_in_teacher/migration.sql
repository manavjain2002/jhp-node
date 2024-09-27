/*
  Warnings:

  - You are about to drop the column `email` on the `master_role` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `master_role` table. All the data in the column will be lost.
  - Added the required column `role_access` to the `master_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_name` to the `master_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `master_role_id` to the `teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('1', '2', '3');

-- AlterTable
ALTER TABLE "master_role" DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "role_access" TEXT NOT NULL,
ADD COLUMN     "role_name" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "teacher" ADD COLUMN     "master_role_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_master_role_id_fkey" FOREIGN KEY ("master_role_id") REFERENCES "master_role"("master_role_id") ON DELETE CASCADE ON UPDATE CASCADE;

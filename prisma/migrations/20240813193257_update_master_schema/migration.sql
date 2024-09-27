/*
  Warnings:

  - You are about to drop the column `email` on the `master_role` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `master_role` table. All the data in the column will be lost.
  - Added the required column `role_access` to the `master_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_name` to the `master_role` table without a default value. This is not possible if the table is not empty.

*/

INSERT INTO "master_role"("created_at","updated_at","organization_id","role_access","role_name") VALUES('2024-08-10 00:00:00','2024-08-10 00:00:00',1,'[1,2]','2');

INSERT INTO "master_role"("created_at","updated_at","organization_id","role_access","role_name") VALUES('2024-08-10 00:00:00','2024-08-10 00:00:00',1,'[1]','3');

INSERT INTO "master_role"("created_at","updated_at","organization_id","role_access","role_name") VALUES('2024-08-10 00:00:00','2024-08-10 00:00:00',1,'[1,2,3]','1');
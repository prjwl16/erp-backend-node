/*
  Warnings:

  - You are about to drop the column `totalAmountDue` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmountPaid` on the `PurchaseOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "totalAmountDue",
DROP COLUMN "totalAmountPaid";

/*
  Warnings:

  - You are about to drop the column `clientId` on the `PurchaseOrderInvoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrderInvoice" DROP CONSTRAINT "PurchaseOrderInvoice_clientId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrderInvoice" DROP COLUMN "clientId";

/*
  Warnings:

  - You are about to drop the column `purchaseOrderInvoiceId` on the `PurchaseOrderTransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrderTransaction" DROP CONSTRAINT "PurchaseOrderTransaction_purchaseOrderInvoiceId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "totalAmountDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalAmountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOrderTransaction" DROP COLUMN "purchaseOrderInvoiceId";

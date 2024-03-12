/*
  Warnings:

  - You are about to drop the column `amountDue` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `amountPaid` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `amountReceived` on the `PurchaseOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "amountDue",
DROP COLUMN "amountPaid",
DROP COLUMN "amountReceived",
ADD COLUMN     "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalAmountDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalAmountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "baseAmount" SET DEFAULT 0,
ALTER COLUMN "taxAmount" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "otherCharges" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOrderTransaction" ADD COLUMN     "remarks" TEXT;

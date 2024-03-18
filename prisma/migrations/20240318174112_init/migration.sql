/*
  Warnings:

  - You are about to drop the column `taxAmount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `PurchaseOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "taxAmount",
ADD COLUMN     "cgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "igst" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "otherCharges" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "taxAmount",
ADD COLUMN     "cgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "igst" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "taxSlab" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "baseAmount" DROP DEFAULT;

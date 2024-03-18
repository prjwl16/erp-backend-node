/*
  Warnings:

  - You are about to drop the `PurchaseOrderInvoiceTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrderInvoiceTransaction" DROP CONSTRAINT "PurchaseOrderInvoiceTransaction_purchaseOrderInvoiceId_fkey";

-- DropTable
DROP TABLE "PurchaseOrderInvoiceTransaction";

-- CreateTable
CREATE TABLE "PurchaseOrderTransaction" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "type" "TRANSACTION_TYPE" NOT NULL DEFAULT 'NORMAL',
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "externalReferenceNumber" TEXT,
    "transactionMode" "TRANSACTION_MODE" NOT NULL DEFAULT 'CASH',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "purchaseOrderInvoiceId" INTEGER,
    "purchaseOrderId" INTEGER,

    CONSTRAINT "PurchaseOrderTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchaseOrderTransaction" ADD CONSTRAINT "PurchaseOrderTransaction_purchaseOrderInvoiceId_fkey" FOREIGN KEY ("purchaseOrderInvoiceId") REFERENCES "PurchaseOrderInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderTransaction" ADD CONSTRAINT "PurchaseOrderTransaction_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

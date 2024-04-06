/*
  Warnings:

  - Added the required column `clientId` to the `PurchaseOrderInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrderInvoice" ADD COLUMN     "clientId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseOrderInvoice" ADD CONSTRAINT "PurchaseOrderInvoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

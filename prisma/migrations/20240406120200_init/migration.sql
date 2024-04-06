-- AlterTable
ALTER TABLE "PurchaseOrderInvoice" ADD COLUMN     "clientId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "PurchaseOrderInvoice" ADD CONSTRAINT "PurchaseOrderInvoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

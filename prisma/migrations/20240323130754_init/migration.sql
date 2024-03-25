/*
  Warnings:

  - A unique constraint covering the columns `[purchaseOrderId]` on the table `PurchaseOrderInvoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrderInvoice_purchaseOrderId_key" ON "PurchaseOrderInvoice"("purchaseOrderId");

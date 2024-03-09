/*
  Warnings:

  - Added the required column `clientId` to the `ProductType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "clientId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

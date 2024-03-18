/*
  Warnings:

  - You are about to drop the column `tags` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "tags",
ADD COLUMN     "productTagsId" INTEGER;

-- CreateTable
CREATE TABLE "ProductTags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "ProductTags_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productTagsId_fkey" FOREIGN KEY ("productTagsId") REFERENCES "ProductTags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

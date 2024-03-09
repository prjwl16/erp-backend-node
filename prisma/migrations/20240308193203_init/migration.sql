-- DropForeignKey
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_managerId_fkey";

-- AlterTable
ALTER TABLE "Warehouse" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

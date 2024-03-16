-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PURCHASE_ORDER_STATUS" AS ENUM ('DRAFT', 'PLACED', 'IN_TRANSIT', 'DELIVERED');

-- CreateEnum
CREATE TYPE "PURCHASE_ORDER_PAYMENT_STATUS" AS ENUM ('PAID', 'PARTIALLY_PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "TRANSACTION_MODE" AS ENUM ('CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE', 'OTHER');

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "clientId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "sku" TEXT,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "taxSlab" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "otherCharges" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "tags" TEXT[],
    "clientId" INTEGER NOT NULL,
    "updatedById" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "productTypeId" INTEGER NOT NULL,
    "purchaseOrderId" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "subCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "managerId" INTEGER,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse_Product" (
    "id" SERIAL NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Warehouse_Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "gstin" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "clientId" INTEGER NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "supplierId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmountDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryDate" TIMESTAMP(3),
    "orderStatus" "PURCHASE_ORDER_STATUS" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PURCHASE_ORDER_PAYMENT_STATUS" NOT NULL DEFAULT 'UNPAID',
    "createdById" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderStatusLog" (
    "id" SERIAL NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "status" "PURCHASE_ORDER_STATUS" NOT NULL,
    "remarks" TEXT,
    "note" TEXT,
    "logs" TEXT,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "PurchaseOrderStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderTransaction" (
    "id" SERIAL NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "externalReferenceNumber" TEXT,
    "transactionMode" "TRANSACTION_MODE" NOT NULL DEFAULT 'CASH',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "PurchaseOrderTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON "_CategoryToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subCategory" ADD CONSTRAINT "subCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse_Product" ADD CONSTRAINT "Warehouse_Product_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse_Product" ADD CONSTRAINT "Warehouse_Product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderStatusLog" ADD CONSTRAINT "PurchaseOrderStatusLog_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderStatusLog" ADD CONSTRAINT "PurchaseOrderStatusLog_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderTransaction" ADD CONSTRAINT "PurchaseOrderTransaction_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import prisma from './prisma.js'

const updatePurchaseOrders = async () => {
  // update the total amount due and total amount paid for each purchase order
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      PurchaseOrderTransactions: true,
      PurchaseOrderInvoice: true,
    },
  })

  const purchaseOrdersToUpdatePromises = []

  for (const purchaseOrder of purchaseOrders) {
    const totalTxnAmount = parseFloat(
      purchaseOrder.PurchaseOrderTransactions.reduce((acc, txn) => acc + txn.amount, 0).toFixed(2)
    )

    const totalAmountDue = parseFloat((purchaseOrder.PurchaseOrderInvoice.totalAmount - totalTxnAmount).toFixed(2))
    const totalAmountPaid = parseFloat(totalTxnAmount.toFixed(2))

    purchaseOrdersToUpdatePromises.push(
      prisma.purchaseOrder.update({
        where: {
          id: purchaseOrder.id,
        },
        data: {
          totalAmountDue,
          totalAmountPaid,
        },
      })
    )
  }

  await Promise.all(purchaseOrdersToUpdatePromises)
}

updatePurchaseOrders()

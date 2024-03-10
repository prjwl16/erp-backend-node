const prisma = require('../prisma')
exports.createPurchaseOrderTransaction = async (req, res) => {
  try {
    const { purchaseOrderId, amountReceived } = req.body
    // get total pending amount to pay
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
      },
    })
    if (!purchaseOrder) {
      return res.status(404).json({ status: 'fail', error: 'Purchase order not found' })
    }

    const totalPendingAmount = purchaseOrder.amountDue

    if (totalPendingAmount === 0) {
      return res.status(400).json({ status: 'fail', error: 'No pending amount to pay', data: purchaseOrder })
    }

    if (amountReceived > totalPendingAmount) {
      return res.status(400).json({
        status: 'fail',
        error: 'Amount received cannot be greater than the pending amount',
        amountDue: totalPendingAmount,
      })
    }

    const paymentStatus = totalPendingAmount - amountReceived === 0 ? 'PAID' : 'PARTIALLY_PAID'

    const result = await prisma.$transaction([
      prisma.purchaseOrderTransaction.create({
        data: {
          amount: amountReceived,
          transactionDate: new Date(),
          purchaseOrder: {
            connect: {
              id: purchaseOrderId,
            },
          },
        },
      }),
      prisma.purchaseOrder.update({
        where: {
          id: purchaseOrderId,
        },
        data: {
          amountPaid: purchaseOrder.amountPaid + amountReceived,
          amountDue: totalPendingAmount - amountReceived,
          paymentStatus,
        },
      }),
    ])

    res.status(200).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'fail', error: 'Failed to add the purchase order transaction' })
  }
}

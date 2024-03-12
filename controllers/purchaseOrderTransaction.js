const prisma = require('../prisma')
const { invalidRequest, success, serverError } = require('../utils/response')

exports.createPurchaseOrderTransaction = async (req, res) => {
  try {
    const { purchaseOrderId, transactionAmount } = req.body

    if (!purchaseOrderId || !transactionAmount) {
      return invalidRequest(res, 'Purchase order id and transaction amount are required')
    }
    if (transactionAmount <= 0) {
      return invalidRequest(res, 'Transaction amount should be greater than 0')
    }

    // get total pending amount to pay
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
      },
    })

    if (!purchaseOrder) {
      return invalidRequest(res, 'Purchase order not found')
    }

    if (purchaseOrder.totalAmountDue <= 0) {
      invalidRequest(res, 'No pending amount to pay')
    }

    if (transactionAmount > purchaseOrder.totalAmountDue) {
      return invalidRequest(res, 'Amount received cannot be greater than the pending amount')
    }

    //amounts / fields to be updated in purchase order table

    const totalPendingAmount = purchaseOrder.totalAmountDue - transactionAmount
    const totalAmountPaid = purchaseOrder.totalAmountPaid + transactionAmount

    const paymentStatus = purchaseOrder.totalAmountDue - transactionAmount === 0 ? 'PAID' : 'PARTIALLY_PAID'

    //TODO: rollback if any of the transaction fails

    const result = await prisma.$transaction([
      prisma.purchaseOrderTransaction.create({
        data: {
          amount: transactionAmount,
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
          totalAmountPaid: totalAmountPaid,
          totalAmountDue: totalPendingAmount,
          paymentStatus,
        },
      }),
    ])

    return success(res, result, 'Purchase order transaction added successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to add the purchase order transaction')
  }
}

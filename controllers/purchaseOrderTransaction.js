import { Router } from 'express'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'

const createPurchaseOrderTransaction = async (req, res) => {
  try {
    const { purchaseOrderId, transactionAmount, transactionDate, transactionMode, externalReferenceNumber, remarks } =
      req.body

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

    const purchaseOrderData = await prisma.purchaseOrder.update({
      where: {
        id: purchaseOrderId,
      },
      data: {
        totalAmountPaid: totalAmountPaid,
        totalAmountDue: totalPendingAmount,
        paymentStatus,
        PurchaseOrderTransactions: {
          create: {
            amount: transactionAmount,
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            transactionMode: transactionMode || 'CASH',
            remarks: remarks,
            externalReferenceNumber: externalReferenceNumber,
          },
        },
      },
    })

    return success(res, { purchaseOrderData }, 'Purchase order transaction added successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to add the purchase order transaction')
  }
}

const purchaseOrderTransactionsRouter = Router()

purchaseOrderTransactionsRouter.post('/', createPurchaseOrderTransaction)

export default purchaseOrderTransactionsRouter

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

    const totalPendingAmount = parseFloat((purchaseOrder.totalAmountDue - transactionAmount).toFixed(2))
    const totalAmountPaid = parseFloat((purchaseOrder.totalAmountPaid + transactionAmount).toFixed(2))

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

const deletePurchaseOrderTransaction = async (req, res) => {
  try {
    let { purchaseOrderTransactionId } = req.params

    if (!purchaseOrderTransactionId) {
      return invalidRequest(res, 'Purchase order transaction id is required')
    }

    purchaseOrderTransactionId = parseInt(purchaseOrderTransactionId)

    const purchaseOrderTransaction = await prisma.purchaseOrderTransaction.findUnique({
      where: {
        id: purchaseOrderTransactionId,
      },
    })

    if (!purchaseOrderTransaction) {
      return invalidRequest(res, 'Purchase order transaction not found')
    }

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderTransaction.purchaseOrderId,
        client: {
          id: req.user.client.id,
        },
      },
      include: {
        PurchaseOrderInvoice: true,
      },
    })

    if (!purchaseOrder) {
      return invalidRequest(res, 'Purchase order not found')
    }

    const txnAmount = parseFloat(purchaseOrderTransaction.amount) || 0

    const totalAmountPaid = parseFloat((purchaseOrder.totalAmountPaid - txnAmount).toFixed(2))
    const totalAmountDue = parseFloat((purchaseOrder.totalAmountDue + txnAmount).toFixed(2))

    const paymentStatus = totalAmountDue === 0 ? 'PAID' : 'PARTIALLY_PAID'

    const purchaseOrderData = await prisma.purchaseOrder.update({
      where: {
        id: purchaseOrderTransaction.purchaseOrderId,
      },
      data: {
        totalAmountPaid: totalAmountPaid,
        totalAmountDue: totalAmountDue,
        paymentStatus,
        PurchaseOrderTransactions: {
          delete: {
            id: purchaseOrderTransactionId,
          },
        },
      },
    })

    return success(res, { purchaseOrderData }, 'Purchase order transaction deleted successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to delete the purchase order transaction')
  }
}

const purchaseOrderTransactionsRouter = Router()

purchaseOrderTransactionsRouter.post('/', createPurchaseOrderTransaction)
purchaseOrderTransactionsRouter.delete('/:purchaseOrderTransactionId', deletePurchaseOrderTransaction)

export default purchaseOrderTransactionsRouter

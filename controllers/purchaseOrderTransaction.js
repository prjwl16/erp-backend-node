import { Router } from 'express'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'
import { validateCreatePurchaseOrderTransactionRequest } from '../middlewares/purchaseOrderTransactions.js'
import { getPurchaseOrderStatus } from '../utils/purchaseOrder.js'

const addPurchaseOrderTransaction = async (req, res) => {
  try {
    const { purchaseOrderId, transactionAmount, transactionDate, transactionMode, externalReferenceNumber, remarks } =
      req.body

    // get total pending amount to pay
    const purchaseOrderPromise = prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
      },
      include: {
        PurchaseOrderInvoice: true,
        PurchaseOrderTransactions: true,
      },
    })
    const transactionSumPromise = prisma.purchaseOrderTransaction.aggregate({
      where: {
        purchaseOrderId: purchaseOrderId,
      },
      _sum: {
        amount: true,
      },
    })
    const [purchaseOrder, transactionSum] = await Promise.all([purchaseOrderPromise, transactionSumPromise])

    if (!purchaseOrder) {
      return invalidRequest(res, 'Purchase order not found')
    }

    let totalAmountPaid = transactionSum._sum.amount || 0
    const totalAmountDue = purchaseOrder.PurchaseOrderInvoice.totalAmount - totalAmountPaid

    if (totalAmountDue <= 0) {
      return invalidRequest(res, 'No pending amount to pay')
    }

    if (transactionAmount > totalAmountDue) {
      return invalidRequest(res, 'Amount received cannot be greater than the pending amount')
    }

    // amounts / fields to be updated in purchase order table
    const paymentStatus = getPurchaseOrderStatus(
      totalAmountDue,
      totalAmountPaid + transactionAmount,
      purchaseOrder.PurchaseOrderInvoice.totalAmount
    )

    const purchaseOrderData = await prisma.purchaseOrder.update({
      where: {
        id: purchaseOrderId,
      },
      data: {
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
        PurchaseOrderTransactions: true,
      },
    })

    if (!purchaseOrder) {
      return invalidRequest(res, 'Purchase order not found')
    }

    let totalAmountPaid = 0
    purchaseOrder.PurchaseOrderTransactions.forEach((transaction) => {
      totalAmountPaid += transaction.amount
    })

    const totalAmountDue = purchaseOrder.PurchaseOrderInvoice.totalAmount - totalAmountPaid
    totalAmountPaid -= purchaseOrderTransaction.amount

    const paymentStatus = getPurchaseOrderStatus(
      totalAmountDue,
      totalAmountPaid,
      purchaseOrder.PurchaseOrderInvoice.totalAmount
    )

    const purchaseOrderData = await prisma.purchaseOrder.update({
      where: {
        id: purchaseOrderTransaction.purchaseOrderId,
      },
      data: {
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

purchaseOrderTransactionsRouter.post('/', validateCreatePurchaseOrderTransactionRequest, addPurchaseOrderTransaction)
purchaseOrderTransactionsRouter.delete('/:purchaseOrderTransactionId', deletePurchaseOrderTransaction)

export default purchaseOrderTransactionsRouter

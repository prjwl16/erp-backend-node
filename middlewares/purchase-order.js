import { invalidRequest, serverError } from '../utils/response.js'
import moment from 'moment/moment.js'
import prisma from '../prisma.js'

const parseDate = (date) => {
  const parsedDate = moment(date, 'YYYY-MM-DD')
  // set indian timezone
  parsedDate.utcOffset('+05:30')
  return new Date(parsedDate.valueOf())
}

export const isValidCreatPurchaseOrderRequest = (req, res, next) => {
  try {
    const { totalAmount, baseAmount, otherCharges, advancePaid, cgst, sgst, igst } = req.body.invoiceData

    // check if the total amount is greater than other components
    if (totalAmount <= 0) {
      return invalidRequest(res, 'Total amount cannot be negative or zero')
    }

    if (advancePaid > totalAmount) {
      return invalidRequest(res, 'Advance paid cannot be greater than total amount')
    }

    // compare with round figure
    if (Math.round(totalAmount) !== Math.round(baseAmount + otherCharges + cgst + sgst + igst)) {
      return invalidRequest(res, 'Total amount should be equal to base amount + tax amounts + other charges')
    }
    next()
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to fetch the purchase orders')
  }
}

export const setDatesInCorrectFormat = (req, res, next) => {
  const { body } = req

  try {
    if (body.deliveryDate) {
      body.deliveryDate = parseDate(body.deliveryDate)
    }
    if (body.orderDate) {
      body.orderDate = parseDate(body.orderDate)
    }

    if (body.invoiceData.invoiceDate) {
      body.invoiceData.invoiceDate = parseDate(body.invoiceData.invoiceDate)
    }

    if (body.invoiceData.invoiceDueDate) {
      body.invoiceData.invoiceDueDate = parseDate(body.invoiceData.invoiceDueDate)
    }

    if (body.invoiceData.transactionDate) {
      body.invoiceData.transactionDate = parseDate(body.invoiceData.transactionDate)
    }
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to set dates in correct format')
  }

  next()
}

export const validateUpdatePurchaseOrderRequest = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (!id) {
      return invalidRequest(res, 'Invalid purchase order id')
    }

    const { advancePaid, totalAmount, baseAmount, otherCharges, cgst, sgst, igst } = req.body.invoiceData

    // compare with round figure
    if (Math.round(totalAmount) !== Math.round(baseAmount + otherCharges + cgst + sgst + igst)) {
      return invalidRequest(res, 'Total amount should be equal to base amount + tax amounts + other charges')
    }

    if (advancePaid > totalAmount) {
      return invalidRequest(res, 'Advance paid cannot be greater than total amount')
    }

    if (advancePaid < 0) {
      return invalidRequest(res, 'Advance paid cannot be negative')
    }

    // check the transactions for this purchase order and the sum of the transactions
    const transactionsSum = await prisma.purchaseOrderTransaction.aggregate({
      where: {
        purchaseOrderId: id,
      },
      _sum: {
        amount: true,
      },
    })

    if (transactionsSum._sum.amount > totalAmount) {
      return invalidRequest(
        res,
        'You have paid more than the total amount. Please delete the transactions or update the amount'
      )
    }

    req.body.totalAmountPaidCalculatedFromTransactions = transactionsSum._sum.amount

    next()
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to validate the purchase order')
  }
}

export const calculateTotalDueAmount = (finalInvoiceTotalAmount, finalTotalPaidAmount) => {
  return finalInvoiceTotalAmount - finalTotalPaidAmount
}

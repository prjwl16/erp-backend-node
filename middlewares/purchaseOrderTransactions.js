import { invalidRequest, serverError } from '../utils/response.js'

export const validateCreatePurchaseOrderTransactionRequest = (req, res, next) => {
  try {
    const { purchaseOrderId, transactionAmount } = req.body

    if (!purchaseOrderId) {
      return invalidRequest(res, 'Purchase order id is required')
    }

    if (!transactionAmount || transactionAmount <= 0) {
      return invalidRequest(res, 'Amount cannot be negative or zero')
    }

    next()
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to validate the purchase order transaction request')
  }
}

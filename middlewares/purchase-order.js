import { invalidRequest, serverError } from '../utils/response.js'

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
    console.log(Math.round(totalAmount), Math.round(baseAmount + otherCharges + cgst + sgst + igst))
    if (Math.round(totalAmount) !== Math.round(baseAmount + otherCharges + cgst + sgst + igst)) {
      return invalidRequest(res, 'Total amount should be equal to base amount + tax amounts + other charges')
    }
    next()
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to fetch the purchase orders')
  }
}

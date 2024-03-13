const { serverError, invalidRequest } = require('../utils/response')
exports.isValidCreatPurchaseOrderRequest = (req, res, next) => {
  try {
    let { totalAmount, baseAmount, taxAmount, otherCharges, advancePaid } = req.body
    advancePaid = advancePaid || 0

    // check if the total amount is greater than other components
    if (totalAmount <= 0) {
      return invalidRequest(res, 'Total amount cannot be negative or zero')
    }
    if (totalAmount < advancePaid) {
      return invalidRequest(res, 'Total amount cannot be less than advance paid')
    }
    if (totalAmount !== baseAmount + taxAmount + otherCharges) {
      return invalidRequest(res, 'Total amount should be equal to base amount + tax amount + other charges')
    }
    next()
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to fetch the purchase orders')
  }
}

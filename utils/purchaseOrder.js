// in case of adding the txn pass the totalAmountPaid + transaction amount
export const getPurchaseOrderStatus = (totalDueAmount, totalAmountPaid, totalAmount) => {
  console.log(totalDueAmount, totalAmountPaid, totalAmount)

  let paymentStatus = 'UNPAID'
  if (totalAmountPaid === totalAmount) {
    paymentStatus = 'PAID'
  } else if (totalAmountPaid > 0 && totalAmountPaid < totalAmount) {
    paymentStatus = 'PARTIALLY_PAID'
  }
  return paymentStatus
}

export const getPurchaseOrderDueAmount = (totalAmountPaid, totalAmount) => {
  return totalAmount - totalAmountPaid
}

export const getPurchaseOrderTotalAmountPaid = (totalAmountPaid, transactionAmount) => {
  return totalAmountPaid + transactionAmount
}

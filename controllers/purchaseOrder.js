const prisma = require('../prisma')
const { success, serverError, invalidRequest } = require('../utils/response')

const limit = 10

exports.createPurchaseOrder = async (req, res) => {
  let {
    name,
    description,
    notes,
    supplierId,
    totalAmount,
    baseAmount,
    taxAmount,
    otherCharges,
    advancePaid,
    quantity,
  } = req.body
  const { id: createdBy } = req.user

  advancePaid = advancePaid || 0
  const totalAmountDue = totalAmount - advancePaid
  const totalAmountPaid = advancePaid
  const paymentStatus = advancePaid === totalAmount ? 'PAID' : advancePaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID'

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

  // check if the supplier exists
  const supplier = await prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
  })
  if (!supplier) {
    return invalidRequest(res, 'Supplier not found')
  }

  try {
    const newPurchaseOrder = await prisma.purchaseOrder.create({
      data: {
        name,
        description,
        supplier: {
          connect: {
            id: supplierId,
          },
        },
        quantity,
        notes,
        baseAmount,
        taxAmount,
        totalAmount,
        otherCharges,
        paymentStatus,

        // these could be calculated from the transaction table but for now we are keeping it simple
        totalAmountDue, // Amount which client is yet to pay to the supplier
        totalAmountPaid, // Amount which client has already paid to the supplier
        advancePaid, // Amount which client has already paid to the supplier as advance (not related to the purchase order transaction)
        client: {
          connect: {
            id: req.user.clientId,
          },
        },
        createdBy: {
          connect: {
            id: createdBy,
          },
        },
      },
    })
    success(res, newPurchaseOrder, 'Purchase order added successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to add the purchase order')
  }
}

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: id,
      },
      include: {
        PurchaseOrderTransaction: true,
      },
    })
    success(res, purchaseOrder, 'Purchase order fetched successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to fetch the purchase order')
  }
}

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const { page } = req.query
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        clientId: req.user.clientId,
      },
      include: {
        supplier: true,
        createdBy: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    })
    success(res, purchaseOrders, 'Purchase orders fetched successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to fetch the purchase orders')
  }
}

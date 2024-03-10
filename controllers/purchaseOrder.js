const prisma = require('../prisma')

exports.createPurchaseOrder = async (req, res) => {
  const {
    supplierId,
    totalAmount,
    baseAmount,
    quantity,
    taxAmount,
    otherCharges,
    amountDue,
    amountPaid,
    amountReceived,
    name,
    description,
  } = req.body
  const { id: createdBy } = req.user

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
        baseAmount,
        taxAmount,
        totalAmount,
        otherCharges,

        amountDue,
        amountPaid,
        amountReceived,

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
    res.status(200).json(newPurchaseOrder)
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'fail', error: 'Failed to add the purchase order' })
  }
}

exports.getPurchaseOrderById = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: id,
      },
      include: {
        PurchaseOrderTransaction: true,
      },
    })
    res.status(200).json(purchaseOrder)
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'fail', error: 'Failed to fetch purchase order' })
  }
}

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        clientId: req.user.clientId,
      },
      include: {
        supplier: true,
        createdBy: true,
      },
    })
    res.status(200).json(purchaseOrders)
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'fail', error: 'Failed to fetch purchase orders' })
  }
}

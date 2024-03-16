import { isValidCreatPurchaseOrderRequest } from '../middlewares/purchase-order.js'
import { Router } from 'express'
import prisma from '../prisma.js'

const limit = 10

const createPurchaseOrder = async (req, res) => {
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
  try {
    const { id: createdBy } = req.user

    advancePaid = advancePaid || 0
    const totalAmountDue = totalAmount - advancePaid
    const totalAmountPaid = advancePaid
    const paymentStatus = advancePaid === totalAmount ? 'PAID' : advancePaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID'

    // check if the supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },
    })
    if (!supplier) {
      return invalidRequest(res, 'Supplier not found')
    }

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

        PurchaseOrderStatusLog: {
          create: {
            remarks: 'Purchase order created',
            status: 'PLACED',
            updatedBy: {
              connect: {
                id: createdBy,
              },
            },
          },
        },

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
    success(res, { newPurchaseOrder }, 'Purchase order added successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to add the purchase order')
  }
}

const getPurchaseOrderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: id,
      },
      include: {
        PurchaseOrderTransaction: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        supplier: true,
        PurchaseOrderStatusLog: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
    success(res, { purchaseOrder }, 'Purchase order fetched successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to fetch the purchase order')
  }
}

const getAllPurchaseOrders = async (req, res) => {
  try {
    const { page, orderStatus, paymentStatus } = req.query
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        clientId: req.user.clientId,
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
      },
      include: {
        supplier: true,
        createdBy: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })
    const totalPurchaseOrders = await prisma.purchaseOrder.count({
      where: {
        clientId: req.user.clientId,
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
      },
    })
    success(res, { purchaseOrders, totalPurchaseOrders }, 'Purchase orders fetched successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to fetch the purchase orders')
  }
}

const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { orderStatus } = req.body

    if (!orderStatus) {
      return invalidRequest(res, 'Order status is required')
    }

    const [updatedPurchaseOrder, newLog] = await prisma.$transaction([
      prisma.purchaseOrder.update({
        where: {
          id,
        },
        data: {
          orderStatus,
        },
      }),
      prisma.purchaseOrderStatusLog.create({
        data: {
          remarks: `Order status updated to ${orderStatus}`,
          purchaseOrder: {
            connect: {
              id,
            },
          },
          status: orderStatus,
          updatedBy: {
            connect: {
              id: req.user.id,
            },
          },
        },
      }),
    ])

    success(res, { updatedPurchaseOrder, newLog }, 'Purchase order status updated successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to update the purchase order status')
  }
}

const purchaseOrderRouter = Router()

purchaseOrderRouter.get('/pages', getAllPurchaseOrders)
purchaseOrderRouter.post('/', isValidCreatPurchaseOrderRequest, createPurchaseOrder)
purchaseOrderRouter.get('/:id', getPurchaseOrderById)
purchaseOrderRouter.put('/status/:id', updatePurchaseOrderStatus)

export default purchaseOrderRouter

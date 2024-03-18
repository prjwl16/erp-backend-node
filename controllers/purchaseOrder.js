import { isValidCreatPurchaseOrderRequest } from '../middlewares/purchase-order.js'
import { Router } from 'express'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'
import { isSupplierExists } from '../middlewares/supplier.js'

const limit = 10

const createPurchaseOrder = async (req, res) => {
  let { name, description, notes, quantity, deliveryDate, orderDate, supplierId, invoiceData, orderStatus } = req.body
  try {
    const { id: createdBy } = req.user

    let {
      invoiceNumber,
      remarks,
      invoiceDate,
      invoiceDueDate,
      baseAmount,
      otherCharges,
      totalAmount,
      cgst,
      sgst,
      igst,
      taxSlab,
      advancePaid,
      transactionMode,
      externalReferenceNumber,
    } = invoiceData

    if (!orderDate) orderDate = new Date()
    else orderDate = new Date(orderDate)

    // Calculation
    const totalAmountDue = totalAmount - advancePaid
    const totalAmountPaid = advancePaid
    const paymentStatus = advancePaid === totalAmount ? 'PAID' : advancePaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID'

    // Create the purchase order
    let transaction = {}
    if (advancePaid > 0) {
      transaction = {
        amount: advancePaid,
        remarks: 'Advance paid',
        type: 'ADVANCE',
        transactionDate: orderDate,
        transactionMode: transactionMode || 'CASH',
        externalReferenceNumber: externalReferenceNumber || null,
      }
    }

    let newPurchaseOrder = {
      name,
      description,
      notes,
      quantity,
      totalAmountDue,
      totalAmountPaid,
      deliveryDate: new Date(deliveryDate).getTime(),
      paymentStatus,
      orderStatus: orderStatus || 'DRAFT',
      orderDate: new Date(orderDate),
      createdBy: {
        connect: {
          id: createdBy,
        },
      },
      client: {
        connect: {
          id: req.user.clientId,
        },
      },
      supplier: {
        connect: {
          id: supplierId,
        },
      },
      PurchaseOrderInvoice: {
        create: {
          invoiceNumber: invoiceNumber || '',
          remarks: remarks || 'Purchase order created',
          invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
          invoiceDueDate: invoiceDueDate ? new Date(invoiceDueDate) : null,
          baseAmount,
          otherCharges,
          totalAmount,
          taxSlab,
          cgst,
          sgst,
          igst,
        },
      },
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
    }

    if (advancePaid > 0) {
      newPurchaseOrder.PurchaseOrderTransactions = {
        create: transaction,
      }
    }

    newPurchaseOrder = await prisma.purchaseOrder.create({
      data: newPurchaseOrder,
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
        PurchaseOrderTransactions: {
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
        Products: true,
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
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
purchaseOrderRouter.post('/', isValidCreatPurchaseOrderRequest, isSupplierExists, createPurchaseOrder)
purchaseOrderRouter.get('/:id', getPurchaseOrderById)
purchaseOrderRouter.put('/status/:id', updatePurchaseOrderStatus)

export default purchaseOrderRouter

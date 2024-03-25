import { isValidCreatPurchaseOrderRequest } from '../middlewares/purchase-order.js'
import { Router } from 'express'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'
import { isSupplierExists } from '../middlewares/supplier.js'
import moment from 'moment'

const limit = 10

const parseDate = (date) => {
  const parsedDate = moment(date, 'DD-MM-YYYY')
  return new Date(parsedDate.valueOf())
}

const setDatesInCorrectFormat = (body) => {
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
}

const createPurchaseOrder = async (req, res) => {
  try {
    const { id: createdBy } = req.user

    setDatesInCorrectFormat(req.body)

    let { name, description, notes, quantity, deliveryDate, orderDate, supplierId, invoiceData, orderStatus } = req.body
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

    console.log('req.body', req.body)

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
      deliveryDate: deliveryDate,
      paymentStatus,
      orderStatus: orderStatus || 'DRAFT',
      orderDate: orderDate,
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
          invoiceDate: invoiceDate ? invoiceDate : null,
          invoiceDueDate: invoiceDueDate ? invoiceDueDate : null,
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
          status: orderStatus || 'DRAFT',
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

    console.log('newPurchaseOrder', newPurchaseOrder)

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
        PurchaseOrderInvoice: true,
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
        PurchaseOrderInvoice: true,
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
          PurchaseOrder: {
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

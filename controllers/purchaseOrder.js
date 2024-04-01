import {
  isValidCreatPurchaseOrderRequest,
  setDatesInCorrectFormat,
  validateUpdatePurchaseOrderRequest,
} from '../middlewares/purchase-order.js'
import { Router } from 'express'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'
import { isSupplierExists } from '../middlewares/supplier.js'
import { getPurchaseOrderStatus } from '../utils/purchaseOrder.js'

const limit = 10

const createPurchaseOrder = async (req, res) => {
  try {
    const { id: createdBy } = req.user

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

    newPurchaseOrder = await prisma.purchaseOrder.create({
      data: newPurchaseOrder,
    })

    success(res, { newPurchaseOrder }, 'Purchase order added successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to add the purchase order')
  }
}

const updatePurchaseOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const {
      name,
      description,
      notes,
      quantity,
      deliveryDate,
      orderDate,
      supplierId,
      invoiceData,
      orderStatus,
      transactionsSum,
    } = req.body
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

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id,
      },
      include: {
        PurchaseOrderInvoice: true,
        PurchaseOrderTransactions: true,
      },
    })
    // resolve promises

    let totalAmountPaid = transactionsSum || 0
    let totalAmountDue = purchaseOrder.PurchaseOrderInvoice.totalAmount - totalAmountPaid

    if (totalAmountPaid > totalAmount) {
      return invalidRequest(
        res,
        'You have paid more than the total amount. Please delete the transactions or update the amount'
      )
    }
    if (totalAmountDue < 0) {
      return invalidRequest(res, 'Total amount paid is greater than total amount')
    }

    // Create the purchase order payload

    //steps
    // 1 check if the advance transaction is already present or not
    // 2 if present & amount is 0 then delete the transaction
    // 3 if present & amount is greater than 0 then update the transaction
    // 4 if not present & amount is greater than 0 then create the transaction
    // 5 if not present & amount is 0 then do nothing

    let transaction = {
      amount: advancePaid,
      remarks: 'Advance paid',
      type: 'ADVANCE',
      transactionDate: orderDate,
      transactionMode: transactionMode || 'CASH',
      externalReferenceNumber: externalReferenceNumber || null,
    }

    // steps 1
    const advanceTransaction = purchaseOrder.PurchaseOrderTransactions.find(
      (transaction) => transaction.type === 'ADVANCE'
    )
    const advanceTransactionId = advanceTransaction ? advanceTransaction.id : null
    const existingAdvancePaid = advanceTransaction ? advanceTransaction.amount : advancePaid

    let actionOnTransaction = null

    // steps 2 & 3
    if (advanceTransactionId && advancePaid === 0) {
      actionOnTransaction = 'delete'
      totalAmountPaid -= existingAdvancePaid
      totalAmountDue = totalAmount + existingAdvancePaid
      transaction = {
        id: advanceTransactionId,
      }
    } else if (advanceTransactionId && advancePaid > 0) {
      totalAmountPaid -= existingAdvancePaid
      totalAmountPaid += advancePaid

      if (totalAmountPaid > totalAmount) {
        return invalidRequest(
          res,
          'You have paid more than the total amount. Please delete the transactions or update the amount'
        )
      }

      actionOnTransaction = 'update'
      transaction = {
        where: {
          id: advanceTransactionId,
        },
        data: {
          ...transaction,
        },
      }
    }

    // steps 4
    if (!advanceTransactionId && advancePaid > 0) {
      actionOnTransaction = 'create'
      totalAmountPaid += advancePaid
      totalAmountDue = totalAmount - advancePaid
    }

    const paymentStatus = getPurchaseOrderStatus(totalAmountDue, totalAmountPaid, totalAmount)
    let updatedPurchaseOrder = {
      name,
      description,
      notes,
      quantity,
      deliveryDate: deliveryDate,
      paymentStatus,
      orderStatus: orderStatus || 'DRAFT',
      orderDate: orderDate,
      supplier: {
        connect: {
          id: supplierId,
        },
      },
      PurchaseOrderInvoice: {
        update: {
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
        connectOrCreate: {
          where: {
            PurchaseOrder: {
              is: {
                id,
              },
            },
          },
          create: {
            remarks: 'Purchase order updated',
            status: orderStatus || 'DRAFT',
            updatedBy: {
              connect: {
                id: req.user.id,
              },
            },
          },
        },
      },
    }

    if (actionOnTransaction) {
      updatedPurchaseOrder.PurchaseOrderTransactions = {
        [actionOnTransaction]: {
          ...transaction,
        },
      }
    }

    const newUpdatedPurchaseOrder = await prisma.purchaseOrder.update({
      where: {
        id,
      },
      data: {
        ...updatedPurchaseOrder,
        PurchaseOrderStatusLog: {
          connectOrCreate: {
            where: {
              id: id,
            },
            create: {
              remarks: 'Purchase order updated',
              status: orderStatus || 'DRAFT',
              updatedBy: {
                connect: {
                  id: req.user.id,
                },
              },
            },
          },
        },
      },
    })

    success(res, { updatedPurchaseOrder: newUpdatedPurchaseOrder }, 'Purchase order updated successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to update the purchase order')
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

    purchaseOrder.totalAmountPaid = 0
    purchaseOrder.PurchaseOrderTransactions.forEach((transaction) => {
      purchaseOrder.totalAmountPaid += transaction.amount
    })
    purchaseOrder.totalAmountDue = purchaseOrder.PurchaseOrderInvoice.totalAmount - purchaseOrder.totalAmountPaid

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
purchaseOrderRouter.post(
  '/',
  isValidCreatPurchaseOrderRequest,
  isSupplierExists,
  setDatesInCorrectFormat,
  createPurchaseOrder
)
purchaseOrderRouter.get('/:id', getPurchaseOrderById)
purchaseOrderRouter.put('/status/:id', updatePurchaseOrderStatus)
purchaseOrderRouter.put('/:id', validateUpdatePurchaseOrderRequest, setDatesInCorrectFormat, updatePurchaseOrder)

export default purchaseOrderRouter

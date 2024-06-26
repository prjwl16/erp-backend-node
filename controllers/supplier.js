import prisma from '../prisma.js'
import { Router } from 'express'
import { invalidRequest, serverError, success } from '../utils/response.js'

const limit = 10
const createSupplier = async (req, res) => {
  const { firstName, lastName, email, phone, address, gstin } = req.body
  const { id: createdBy } = req.user

  // check if the supplier already exists with give email or phone for the same client
  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            phone,
          },
        ],
      },
    })

    if (supplier) {
      return invalidRequest(res, 'Supplier already exists')
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        firstName,
        lastName,
        gstin,
        email,
        phone,
        address,
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
    return success(res, { supplier: newSupplier }, 'Supplier created successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to create the supplier')
  }
}

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        clientId: req.user.clientId,
      },
    })

    return success(res, { suppliers }, 'Suppliers fetched successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to fetch the suppliers')
  }
}

const updateSupplier = async (req, res) => {
  console.log('updateSupplier')
  const id = parseFloat(req.params.id)
  if (!id) {
    return invalidRequest(res, 'Invalid supplier id')
  }
  const { firstName, lastName, email, phone, address, gstin } = req.body

  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        client: {
          id: req.user.client.id,
        },
      },
    })

    if (!supplier) {
      return invalidRequest(res, 'Supplier not found')
    }

    const updatedSupplier = await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        firstName,
        lastName,
        gstin,
        email,
        phone,
        address,
      },
    })

    return success(res, { supplier: updatedSupplier }, 'Supplier updated successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to update the supplier')
  }
}

const deleteSupplier = async (req, res) => {
  const id = parseFloat(req.params.id)
  if (!id) {
    return invalidRequest(res, 'Invalid supplier id')
  }

  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        client: {
          id: req.user.client.id,
        },
      },
    })

    if (!supplier) {
      return invalidRequest(res, 'Supplier not found')
    }

    await prisma.supplier.delete({
      where: {
        id,
      },
    })

    return success(res, {}, 'Supplier deleted successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to delete the supplier')
  }
}

const getPurchaseOrdersBySupplier = async (req, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId)
    const page = parseInt(req.params.page) - 1

    const supplier = await prisma.supplier.findFirst({
      where: {
        id: supplierId,
      },
    })
    if (!supplier) {
      return invalidRequest(res, 'Supplier not found')
    }

    const purchaseOrdersPromise = prisma.purchaseOrder.findMany({
      where: {
        supplier: {
          id: supplierId,
        },
      },
      include: {
        PurchaseOrderInvoice: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        supplier: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: page * limit,
    })

    const purchaseOrdersCountPromise = prisma.purchaseOrder.count({
      where: {
        supplierId: supplierId,
      },
    })

    const [purchaseOrders, totalPurchaseOrders] = await Promise.all([purchaseOrdersPromise, purchaseOrdersCountPromise])

    return success(res, { supplier, purchaseOrders, totalPurchaseOrders }, 'Purchase orders fetched successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to fetch the purchase orders')
  }
}

const supplierRouter = Router()

supplierRouter.get('/:supplierId/:page', getPurchaseOrdersBySupplier)
supplierRouter.post('/', createSupplier)
supplierRouter.put('/:id', updateSupplier)
supplierRouter.delete('/:id', deleteSupplier)
supplierRouter.get('/', getSuppliers)

export default supplierRouter

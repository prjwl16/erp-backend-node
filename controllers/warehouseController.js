import { Router } from 'express'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'

const createWarehouse = async (req, res) => {
  console.log('Create Warehouse')
  const { name, location, address, managerId } = req.body

  try {
    const isWarehouseExists = await prisma.warehouse.findFirst({
      where: {
        name,
        clientId: req.user.clientId,
      },
    })

    if (isWarehouseExists) {
      return invalidRequest(res, 'Warehouse already exists')
    }

    let newWarehouse = {
      data: {
        name,
        location,
        address,
        client: {
          connect: {
            id: req.user.clientId,
          },
        },
      },
    }

    if (managerId) {
      newWarehouse.data.manager = {
        connect: {
          id: managerId,
        },
      }
    }

    newWarehouse = await prisma.warehouse.create({
      data: newWarehouse.data,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return success(res, { warehouse: newWarehouse }, 'Warehouse created successfully')
  } catch (error) {
    console.log('error : ', error.message)
    return serverError(res, 'Failed to create the warehouse')
  }
}

const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: {
        clientId: req.user.clientId,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return success(res, { warehouses }, 'Warehouses fetched successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to fetch the warehouses')
  }
}

const getWarehouseById = async (req, res) => {
  const id = parseFloat(req.params.id)
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: {
        id: id,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return success(res, { warehouse }, 'Warehouse fetched successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to fetch the warehouse')
  }
}

const updateWarehouse = async (req, res) => {
  console.log('Update Warehouse')
  const { name, location, address, managerId } = req.body
  const id = parseFloat(req.params.id)
  try {
    const isWarehouseExists = await prisma.warehouse.findFirst({
      where: {
        id,
        clientId: req.user.clientId,
      },
    })

    if (!isWarehouseExists) {
      return invalidRequest(res, 'This warehouse does not exists.')
    }

    const isWarehouseNameExists = await prisma.warehouse.findFirst({
      where: {
        name,
        clientId: req.user.clientId,
        id: {
          not: id,
        },
      },
    })

    if (isWarehouseNameExists) {
      return invalidRequest(res, 'Warehouse name already exists.')
    }

    let updatedWarehouse = {
      data: {
        name,
        location,
        address,
        client: {
          connect: {
            id: req.user.clientId,
          },
        },
      },
    }

    if (managerId) {
      updatedWarehouse.data.manager = {
        connect: {
          id: managerId,
        },
      }
    }

    updatedWarehouse = await prisma.warehouse.update({
      where: {
        id: id,
      },
      data: updatedWarehouse.data,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return success(res, { warehouse: updatedWarehouse }, 'Warehouse updated successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to update the warehouse')
  }
}

const deleteWarehouse = async (req, res) => {
  const id = parseFloat(req.params.id)
  try {
    const isWarehouseExists = await prisma.warehouse.findFirst({
      where: {
        id,
        clientId: req.user.clientId,
      },
    })

    if (!isWarehouseExists) {
      return invalidRequest(res, 'This warehouse does not exists.')
    }

    await prisma.warehouse.delete({
      where: {
        id,
      },
    })

    return success(res, {}, 'Warehouse deleted successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to delete the warehouse')
  }
}

const warehouseRouter = Router()

warehouseRouter.get('/:id', getWarehouseById)
warehouseRouter.post('/', createWarehouse)
warehouseRouter.get('/', getAllWarehouses)
warehouseRouter.put('/:id', updateWarehouse)
warehouseRouter.delete('/:id', deleteWarehouse)

export default warehouseRouter

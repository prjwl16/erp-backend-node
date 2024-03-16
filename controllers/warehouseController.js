import { Router } from 'express'
import prisma from '../prisma.js'

const createWarehouse = async (req, res) => {
  const { name, location, address, managerId } = req.body

  try {
    const isWarehouseExists = await prisma.warehouse.findFirst({
      where: {
        name,
        clientId: req.user.clientId,
      },
    })

    if (isWarehouseExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Warehouse with given name already exists',
      })
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

    newWarehouse = await prisma.warehouse.create(newWarehouse)

    res.status(201).json({
      status: 'success',
      data: {
        warehouse: newWarehouse,
      },
    })
  } catch (error) {
    console.log('error : ', error.message)
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
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
    })

    res.status(200).json({
      status: 'success',
      data: {
        warehouses,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

const getProductsByWarehouseId = async (req, res) => {
  try {
    const { id } = req.params
    const products = await prisma.warehouse_Product.findMany({
      where: {
        warehouseId: id,
        warehouse: {
          clientId: req.user.clientId,
        },
      },
      include: {
        product: true,
      },
    })
    return res.send({
      success: true,
      data: {
        total: products.length,
        products,
      },
    })
  } catch (e) {
    console.error(e)
    return res.status(500).send({
      success: false,
      message: 'We f*ck up..!',
    })
  }
}

const warehouseRouter = Router()

warehouseRouter.get('/:id', getProductsByWarehouseId)
warehouseRouter.post('/', createWarehouse)
warehouseRouter.get('/', getAllWarehouses)

export default warehouseRouter

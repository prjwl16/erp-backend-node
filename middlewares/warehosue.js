import prisma from '../prisma.js'

export const isValidWarehouse = async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.data)
    if (data.warehouseId) {
      const warehouse = await prisma.warehouse.findFirst({
        where: {
          id: data.warehouseId,
          clientId: req.user.clientId,
        },
      })
      if (warehouse) next()
      else {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid warehouse',
        })
      }
    } else if (data.warehouses) {
      const warehouseIds = data.warehouses.map((warehouse) => warehouse.id)

      const warehouses = await prisma.warehouse.findMany({
        where: {
          id: {
            in: warehouseIds,
          },
          clientId: req.user.clientId,
        },
      })
      if (warehouses && warehouseIds.length === warehouses.length) next()
      else {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid warehouses',
        })
      }
    } else {
      return res.status(400).json({
        status: 'fail',
        data: {
          key: 'warehouses',
        },
        message: 'Please select valid warehouse',
      })
    }
  } catch (e) {
    console.error('Err: ', e.message)
    return res.send(400).json({
      success: false,
      message: 'Failed to validate warehouse data',
    })
  }
}

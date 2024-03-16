import prisma from '../prisma.js'
import { invalidRequest } from '../utils/response.js'

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
        return invalidRequest(res, 'Invalid warehouse')
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
        return invalidRequest(res, 'Invalid warehouses')
      }
    } else {
      return invalidRequest(res, 'Please select valid warehouse')
    }
  } catch (e) {
    console.error('Err: ', e.message)
    return invalidRequest(res, 'Failed to validate warehouse data')
  }
}

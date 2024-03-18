// check if the supplier exists
import { invalidRequest } from '../utils/response.js'
import prisma from '../prisma.js'

export const isSupplierExists = async (req, res, next) => {
  const { supplierId } = req.body
  const supplier = await prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
  })
  if (!supplier) {
    return invalidRequest(res, 'Supplier not found')
  }
  next()
}

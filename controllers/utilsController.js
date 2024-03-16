import { Router } from 'express'
import prisma from '../prisma.js'
import { serverError, success } from '../utils/response.js'

const createProductType = async (req, res) => {
  try {
    const { name } = req.body
    const productType = await prisma.productType.create({
      data: {
        name,
        clientId: req.user.clientId,
      },
    })
    return success(res, { productType }, 'Product type created successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to create the product type')
  }
}

const utilsController = Router()
utilsController.post('/create-productType', createProductType)

export default utilsController

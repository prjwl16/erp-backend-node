import { Router } from 'express'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'

const createCategory = async (req, res) => {
  const { name } = req.body
  //check if already exists for the client
  const category = await prisma.category.findFirst({
    where: {
      name: name?.toLowerCase(),
      clientId: req.user.clientId,
    },
  })

  if (category) {
    invalidRequest(res, 'Category already exists')
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name: name?.toLowerCase(),
        client: {
          connect: {
            id: req.user.client.id,
          },
        },
      },
    })

    return success(res, { category: newCategory }, 'Category created successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to create the category')
  }
}

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        clientId: req.user.clientId,
      },
    })

    return success(res, { categories }, 'Categories fetched successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to fetch the categories')
  }
}

const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    //check if category exists
    const isExists = await prisma.category.findFirst({
      where: {
        id: id,
      },
    })

    if (!isExists) {
      invalidRequest(res, 'Category does not exist')
    }

    // check if this category is used by any product

    const products = await prisma.product.findMany({
      where: {
        Category: {
          some: {
            id: id,
          },
        },
      },
    })

    const category = await prisma.category.delete({
      where: {
        id: id,
      },
    })

    if (products.length > 0) {
      invalidRequest(res, 'Category is used by some products')
    }
    success(res, { category }, 'Category deleted successfully')
  } catch (error) {
    console.log(error)
    serverError(res, 'Failed to delete the category')
  }
}

const categoryRouter = Router()
categoryRouter.post('/', createCategory)
categoryRouter.get('/', getCategories)
categoryRouter.delete('/:id', deleteCategory)

export default categoryRouter

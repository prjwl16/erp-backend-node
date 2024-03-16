import prisma from '../prisma.js'
import { invalidRequest } from '../utils/response.js'

export const isValidCategory = async (req, res, next) => {
  try {
    console.log('Data: ', req.body.data)
    const data = JSON.parse(req.body.data)
    console.log('Req: ', req.user.clientId)

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          clientId: req.user.clientId,
        },
      })
      if (category) next()
      else {
        return invalidRequest(res, 'Invalid category')
      }
    } else if (data.categories) {
      const categoryIds = data.categories.map((category) => category.id)
      const categories = await prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
          clientId: req.user.clientId,
        },
      })
      if (categories && categoryIds.length === categories.length) next()
      else {
        return invalidRequest(res, 'Invalid categories')
      }
    } else {
      return invalidRequest(res, 'Please select valid category')
    }
  } catch (e) {
    console.error('Err: ', e)
    return invalidRequest(res, 'Failed to validate category data')
  }
}

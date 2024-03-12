const prisma = require('../prisma')
exports.createCategory = async (req, res) => {
  const { name } = req.body
  //check if already exists for the client
  const category = await prisma.category.findFirst({
    where: {
      name: name?.toLowerCase(),
      clientId: req.user.clientId,
    },
  })

  if (category) {
    return res.status(400).json({
      status: 'fail',
      message: 'Category already exists',
    })
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

    res.status(201).json({
      status: 'success',
      data: {
        category: newCategory,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        clientId: req.user.clientId,
      },
    })

    res.status(200).json({
      status: 'success',
      data: {
        categories,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    //check if category exists
    const isExists = await prisma.category.findFirst({
      where: {
        id: id,
      },
    })

    if (!isExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category does not exist',
      })
    }

    // check if this category is used by any product

    const products = await prisma.product.findMany({
      where: {
        category: {
          some: {
            id: id,
          },
        },
      },
    })

    if (products.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category is in use by a product',
      })
    }

    // const category = await prisma.category.delete({
    //   where: {
    //     id: id,
    //   },
    // })

    res.status(200).json({
      status: 'success',
      data: {},
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: 'fail',
      message: 'Failed to delete the category',
    })
  }
}

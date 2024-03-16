import { Router } from 'express'
import { isValidCategory } from '../middlewares/category.js'
import { isValidWarehouse } from '../middlewares/warehosue.js'
import prisma from '../prisma.js'

const createProduct = async (req, res) => {
  /*
   * if request fails at any point, let say while checking category or warehouse
   * then will send the image path back to FE and then when hitting next request
   * i'll send the images path (aws path) in the request... if it's valid then go ahead...
   * */

  try {
    const data = JSON.parse(req.body.data)

    if (!data) {
      return res.status(400).json({
        success: 'FAILED',
        message: 'Please provide product data',
      })
    }

    const isProductExistsWithGiveCode = await prisma.product.findFirst({
      where: {
        code: data.productCode,
        clientId: req.user.clientId,
      },
    })

    if (isProductExistsWithGiveCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product with given code already exists',
      })
    }

    const warehouses = data.warehouses.map((warehouse) => ({
      warehouseId: warehouse.id,
      stock: warehouse.stock,
    }))

    const images = req.files.map((file) => ({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.location,
    }))

    const paths = images.map((file) => file.path)

    // const categories = data.category.map((category) => ({
    //   id: category.id,
    // }))

    const product = await prisma.product.create({
      data: {
        name: data.productName,
        description: data.productDescription,
        code: data.productCode,
        sku: data.productSku,
        baseAmount: parseFloat(data.baseAmount) || 0,
        taxSlab: parseFloat(data.taxSlab) || 0,
        taxAmount: parseFloat(data.taxAmount) || 0,
        totalAmount: parseFloat(data.sellingAmount) || 0,
        otherCharges: parseFloat(data.otherCharges || '0') || 0,
        images: paths,
        ProductType: {
          connect: {
            id: data.productTypeId || 1, // TODO: remove hardcode
          },
        },

        tags: data.tags || [],
        //connect to many category
        category: {
          connect: {
            id: data.categoryId,
          },
        },
        client: {
          connect: {
            id: req.user.client.id,
          },
        },
        warehouseProduct: {
          createMany: {
            data: warehouses,
          },
        },

        createdBy: {
          connect: {
            id: req.user.id,
          },
        },
        updatedBy: {
          connect: {
            id: req.user.id,
          },
        },
      },
    })

    return res.status(201).json({
      status: 'SUCCESS',
      data: {
        product,
      },
    })
  } catch (e) {
    console.log(e)
    res.status(400).json({
      status: 'fail',
      message: e.message,
    })
  }
}

const getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      warehouseProduct: {
        include: {
          warehouse: true,
        },
      },
    },
  })
  res.status(200).json(product)
}

const updateProduct = async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.status(200).json(product)
}

const deleteProduct = async (req, res) => {
  const product = await prisma.product.delete({
    where: { id: req.params.id },
  })
  res.status(200).json(product)
}

const createProductWithDetails = async (req, res) => {
  const { name, description, price, categoryId, warehouseId, stock, createdById } = req.body

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category: {
          connect: {
            id: categoryId,
          },
        },
        warehouseProduct: {
          create: {
            warehouse: {
              connect: {
                id: warehouseId,
              },
            },
            stock,
          },
        },
        stock,
        createdBy: {
          connect: {
            id: createdById,
          },
        },
        updatedBy: {
          connect: {
            id: createdById,
          },
        },
      },
    })

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct,
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

const limit = 10
const getProducts = async (req, res) => {
  try {
    const { page } = req.query

    const products = prisma.product.findMany({
      where: {
        clientId: req.user.clientId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        warehouseProduct: {
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    })
    const count = prisma.product.count({
      where: {
        clientId: req.user.clientId,
      },
    })

    const [allProducts, totalProducts] = await prisma.$transaction([products, count])

    const totalPages = Math.ceil(totalProducts / limit)

    res.status(200).json({
      status: 'success',
      data: {
        totalPages,
        products: allProducts,
        totalProducts,
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

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString()) // Generate unique key for the file
//     },
//   }),
// })

const productRouter = Router()

productRouter.post('/', isValidCategory, isValidWarehouse, createProduct)
productRouter.get('/pages', getProducts)
productRouter.get('/:id', getProductById)
productRouter.put('/:id', updateProduct)
productRouter.delete('/:id', deleteProduct)

export default productRouter

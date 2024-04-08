import { Router } from 'express'
import { isValidCategory } from '../middlewares/category.js'
import { isValidWarehouse } from '../middlewares/warehosue.js'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'
import multer from 'multer'

const createProduct = async (req, res) => {
  /*
   * if request fails at any point, let say while checking category or warehouse
   * then will send the image path back to FE and then when hitting next request
   * i'll send the images path (aws path) in the request... if it's valid then go ahead...
   * */

  try {
    const data = JSON.parse(req.body.data)

    if (!data) {
      return invalidRequest(res, 'Please provide product data')
    }

    const isProductExistsWithGiveCode = await prisma.product.findFirst({
      where: {
        code: data.productCode,
        clientId: req.user.clientId,
      },
    })

    if (isProductExistsWithGiveCode) {
      return invalidRequest(res, 'Product with the given code already exists')
    }

    const warehouses = data.warehouses.map((warehouse) => ({
      warehouseId: warehouse.id,
      stock: warehouse.stock,
    }))

    const images = req.files?.map((file) => ({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.location,
    }))

    const paths = images?.map((file) => file.path)

    // const categories = data.category.map((category) => ({
    //   id: category.id,
    // }))

    const {
      productName,
      productDescription,
      productCode,
      productSku,
      baseAmount,
      otherCharges,
      totalAmount,
      taxSlab,
      cgst,
      sgst,
      igst,
      productTypeId,
      categoryId,
      tags,
    } = data

    console.log('data', data)

    const product = await prisma.product.create({
      data: {
        name: productName,
        description: productDescription,
        code: productCode,
        sku: productSku,
        baseAmount: parseFloat(baseAmount),
        otherCharges: parseFloat(otherCharges || '0'),
        totalAmount: parseFloat(totalAmount),
        taxSlab: parseFloat(taxSlab),
        cgst: parseFloat(cgst),
        sgst: parseFloat(sgst),
        igst: parseFloat(igst),
        images: paths,
        ProductType: {
          connect: {
            id: 1,
          },
        },
        // conditionally connect to many tags
        ...(tags &&
          tags.length > 0 && {
            tags: {
              connect: tags.map((tag) => ({
                id: tag.id,
              })),
            },
          }),
        //connect to many category
        Category: {
          connect: {
            id: categoryId,
          },
        },
        client: {
          connect: {
            id: req.user.client.id,
          },
        },
        WarehouseProduct: {
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

    return success(res, { product }, 'Product created successfully')
  } catch (e) {
    console.log(e)
    return serverError(res, 'Failed to create the product')
  }
}

const getProductById = async (req, res) => {
  try {
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
    return success(res, { product }, 'Product fetched successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to fetch the product')
  }
}

const updateProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    })
    return success(res, { product }, 'Product updated successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to update the product')
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.delete({
      where: { id: req.params.id },
    })
    return success(res, { product }, 'Product deleted successfully')
  } catch (e) {
    console.log(e)
    return serverError(res, 'Failed to delete the product')
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
    return success(res, { products }, 'Products fetched successfully')
  } catch (e) {
    console.error(e)
    return serverError(res, 'Failed to fetch the products')
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
        Category: {
          select: {
            id: true,
            name: true,
          },
        },
        WarehouseProduct: {
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

    return success(res, { products: allProducts, totalProducts, totalPages }, 'Products fetched successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to fetch the products')
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

const upload = multer()

const productRouter = Router()

productRouter.post('/', upload.none(), isValidCategory, isValidWarehouse, createProduct)
productRouter.get('/pages', getProducts)
productRouter.get('/:id', getProductById)
productRouter.put('/:id', updateProduct)
productRouter.delete('/:id', deleteProduct)

export default productRouter

const {PrismaClient} = require('@prisma/client');
const {deleteFileFromS3} = require("../utils/storage");
const prisma = new PrismaClient();


exports.uploadImages = async (req, res) => {
  const images = req.files.map(file => ({
    filename: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    path: file.location
  }));

  const paths = images.map(file => file.path);

  //append new images to the product

  const productImages = await prisma.product.findFirst({
    where: {id: req.params.productId},
    select: {
      id: true,
      images: true
    }
  })

  if(!productImages) {
    return res.status(400).json({success: false, message: "Product not found"})
  }
  //lenght should be less than 10

  if(productImages.images.length + paths.length > 2) {

    //delete the uploaded images from s3
    console.log(paths);
    await deleteFileFromS3({bucketName: process.env.S3_BUCKET, files: paths})
    return res.status(400).json({success: false, message: "Maximum 10 images are allowed"})
  }

  productImages.images.push(...paths)

  const product = await prisma.product.update({
    where: {id: req.params.productId},
    data: {
      images: productImages.images
    },
  });

  res.status(200).json({success: true, data: product});

}


exports.createProduct = async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({
        success: 'FAILED',
        message: 'Please provide product data',
      });
    }

    //check if code is exists
    const isProductExistsWithGiveCode = await prisma.product.findFirst({
      where: {
        code: data.code,
        clientId: req.user.clientid
      },
    });

    if (isProductExistsWithGiveCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product with given code already exists',
      });
    }

    const warehouses = data.warehouse.map(warehouse => ({
      warehouseId: warehouse.id,
      stock: warehouse.stock
    }))

    console.log(warehouses);


    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        code: data.code,
        sku: data.sku,
        baseAmount: data.baseAmount || 0,
        taxSlab: data.taxSlab || 0,
        taxAmount: data.taxAmount || 0,
        totalAmount: data.totalAmount || 0,
        otherCharges: data.otherCharges || 0,

        //images // will add later
        tags: data.tags,

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
            data: warehouses
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
        }
      },
    });

    return res.status(201).json({
      status: 'SUCCESS',
      data: {
        product,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status: 'fail',
      message: e.message,
    });
  }


};

exports.getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: {id: req.params.id},
    include: {
      category: true,
      warehouseProduct: {
        include: {
          warehouse: true
        }
      }
    }
  });
  res.status(200).json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await prisma.product.update({
    where: {id: req.params.id},
    data: req.body,
  });
  res.status(200).json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await prisma.product.delete({
    where: {id: req.params.id},
  });
  res.status(200).json(product);
};

exports.createProductWithDetails = async (req, res) => {
  const {name, description, price, categoryId, warehouseId, stock, createdById} = req.body;

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
            stock
          }
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
        }
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
}

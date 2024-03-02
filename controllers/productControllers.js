// controllers/productControllers.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {

  //validate request body

  const { details, properties, storage } = req.body;

  const { name, description, images } = details;









  // const product = await prisma.product.create({
  //   data: req.body,
  // });
  res.status(201).json(req.body);
};

exports.getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
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
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await prisma.product.delete({
    where: { id: req.params.id },
  });
  res.status(200).json(product);
};

exports.createProductWithDetails = async (req, res) => {
  const { name, description, price, categoryId, warehouseId, stock, createdById } = req.body;

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
          create:{
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

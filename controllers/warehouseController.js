// controllers/warehouseController.js

const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

exports.createWarehouse = async (req, res) => {
  const {name, location, address} = req.body;

  try {

    const isWarehouseExists = await prisma.warehouse.findFirst({
      where: {
        name,
        clientId: req.user.clientId,
      },
    });

    if (isWarehouseExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Warehouse with given name already exists',
      });
    }

    const newWarehouse = await prisma.warehouse.create({
      data: {
        name,
        location,
        address,
        clientId: req.user.clientId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        warehouse: newWarehouse,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: {
        clientId: req.user.clientId,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        warehouses,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
}

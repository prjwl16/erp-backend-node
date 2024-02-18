// controllers/warehouseController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createWarehouse = async (req, res) => {
    const { name, location, address } = req.body;

    try {
        const newWarehouse = await prisma.warehouse.create({
            data: {
                name,
                location,
                address
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

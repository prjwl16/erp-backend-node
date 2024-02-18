const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const newCategory = await prisma.category.create({
            data: {
                name,
            },
        });

        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

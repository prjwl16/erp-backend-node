exports.getUser =async(req,res)=> {

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'User not found',
        });
    }
    res.status(200).json(user);

}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password,
            },
        });

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

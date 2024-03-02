const bcrypt = require('bcrypt');
const prisma = require("../prisma");

exports.checkIfAlreadyRegistered = async ({email, phone}) => {

    let isClientExists = await prisma.client.findFirst({
        where: {
            email: email,
        },
    });

    if (isClientExists) {
        return {
            isExists: true,
            message: "Client already exists with this email",
        };
    }
    isClientExists = await prisma.client.findFirst({
        where: {
            phone: phone,
        },
    });

    if (isClientExists) {
        return {
            isExists: true,
            message: "Client already exists with this phone",
        };
    }

    return {
        isExists: false,
        message: "Client does not exists with this email",
    };
}

exports.hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

exports.comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

const prisma = require('../prisma')
exports.createSupplier = async (req, res) => {
  const { name, email, phone, address } = req.body
  const { id: createdBy } = req.user

  // check if the supplier already exists with give email or phone for the same client
  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            phone,
          },
        ],
      },
    })

    if (supplier) {
      return res.status(400).json({
        status: 'fail',
        message: 'Supplier already exists with same email or phone',
      })
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        client: {
          connect: {
            id: req.user.clientId,
          },
        },
        createdBy: {
          connect: {
            id: createdBy,
          },
        },
      },
    })
    res.status(200).json(newSupplier)
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'fail', error: 'Failed to add the supplier' })
  }
}

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        clientId: req.user.clientId,
      },
    })
    res.status(200).json(suppliers)
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'fail', error: 'Failed to fetch suppliers' })
  }
}

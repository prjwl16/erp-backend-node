import { Router } from 'express'

const getUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  })
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    })
  }
  res.status(200).json(user)
}

const createUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    })

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    })
  }
}

const getAllUsers = async (req, res) => {
  const { clientId } = req.user.clientId

  const users = await prisma.user.findMany({
    where: {
      clientId: clientId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
      phone: true,
    },
  })

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  })
}

const userRouter = Router()

userRouter.post('/', createUser)
userRouter.get('/', getUser)
userRouter.get('/all', getAllUsers)

export default userRouter

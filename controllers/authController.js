import { checkIfAlreadyRegistered, comparePassword, hashPassword } from '../utils/authUtils.js'
import prisma from '../prisma.js'
import jwt from 'jsonwebtoken'
import { Router } from 'express'

const check = async (req, res) => {
  const isExists = await checkIfAlreadyRegistered(req.body)

  if (isExists) {
    return res.status(400).json({
      message: 'Client already exists with this email',
    })
  }

  res.status(200).json({
    message: 'Client does not exists with this email',
  })
}

const register = async (req, res) => {
  const { firstName, lastName, businessName, email, password, phone, address } = req.body

  const { isExists, message } = await checkIfAlreadyRegistered({ email, phone })

  if (isExists) {
    return res.status(400).json({
      message: message,
    })
  }

  const hashedPassword = await hashPassword(password)

  const userClient = await prisma.user.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      email,
      password: hashedPassword,
      role: 'ADMIN',
      phone,
      client: {
        create: {
          name: businessName,
          email,
          phone,
          address,
        },
      },
    },
  })

  if (!userClient) {
    return res.status(400).json({
      message: 'Client not registered',
    })
  }

  userClient.password = undefined

  const user = await prisma.user.findUnique({
    where: { id: userClient.id },
    include: {
      client: true,
    },
  })

  user.password = undefined

  return res.status(201).json({
    message: 'Client registered successfully',
    data: user,
  })
}

const login = async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      clientId: true,
      client: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({
      message: 'Invalid credentials',
    })
  }

  user.password = undefined

  // Generate token
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
      clientId: user.clientId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  )

  return res.status(200).json({
    message: 'Login successful',
    token,
    data: user,
  })
}

// ROUTES
const authRouter = Router()

authRouter.post('/register/client', register)
authRouter.post('/check', check)
authRouter.post('/login', login)

export default authRouter

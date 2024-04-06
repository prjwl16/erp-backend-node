import { checkIfAlreadyRegistered, comparePassword, hashPassword } from '../utils/authUtils.js'
import prisma from '../prisma.js'
import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { invalidRequest, serverError, success } from '../utils/response.js'

const check = async (req, res) => {
  const isExists = await checkIfAlreadyRegistered(req.body)

  if (isExists) {
    return invalidRequest(res, 'Client already exists with this email')
  }

  return success(res, null, 'Client does not exists with this email')
}

const register = async (req, res) => {
  const { firstName, lastName, businessName, email, password, phone, address } = req.body

  const { isExists, message } = await checkIfAlreadyRegistered({ email, phone })

  if (isExists) {
    return invalidRequest(res, message)
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
          businessName: businessName,
          email,
          phone,
          address,
        },
      },
    },
  })

  if (!userClient) {
    return serverError(res, 'Failed to create the client')
  }

  userClient.password = undefined

  const user = await prisma.user.findUnique({
    where: { id: userClient.id },
    include: {
      client: true,
    },
  })

  user.password = undefined

  return success(res, { user }, 'Client created successfully')
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
          businessName: true,
        },
      },
    },
  })

  if (!user || !(await comparePassword(password, user.password))) {
    return invalidRequest(res, 'Invalid email or password')
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

const resetPassword = async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return invalidRequest(res, 'Invalid email')
  }

  const hashedPassword = await hashPassword(password)

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  })

  if (!updatedUser) {
    return serverError(res, 'Failed to update password')
  }

  return success(res, null, 'Password updated successfully')
}

// ROUTES
const authRouter = Router()

authRouter.post('/register/client', register)
authRouter.post('/check', check)
authRouter.post('/login', login)
authRouter.post('/reset-password-not-public', resetPassword)

export default authRouter

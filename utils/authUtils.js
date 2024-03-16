import prisma from '../prisma.js'
import { compare, hash } from 'bcrypt'

export const checkIfAlreadyRegistered = async ({ email, phone }) => {
  let isClientExists = await prisma.client.findFirst({
    where: {
      email: email,
    },
  })

  if (isClientExists) {
    return {
      isExists: true,
      message: 'Client already exists with this email',
    }
  }
  isClientExists = await prisma.client.findFirst({
    where: {
      phone: phone,
    },
  })

  if (isClientExists) {
    return {
      isExists: true,
      message: 'Client already exists with this phone',
    }
  }

  return {
    isExists: false,
    message: 'Client does not exists with this email',
  }
}

export const hashPassword = async (password) => {
  const saltRounds = 10
  return await hash(password, saltRounds)
}

export const comparePassword = async (password, hashedPassword) => {
  return await compare(password, hashedPassword)
}

import prisma from '../prisma.js'

export const getUserDetails = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      client: true,
    },
  })
  return user
}

const prisma = require("../prisma");

exports.getUserDetails = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {id: userId},
    include: {
      client: true,
      
    },
  });
  return user;
}

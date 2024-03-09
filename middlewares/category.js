const prisma = require("../prisma");
exports.isValidCategory = async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.data)
    console.log("Data: ", data);
    console.log("Req: ", req.user.clientId);

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          clientId: req.user.clientId
        }
      })
      if (category) next()
      else {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid category',
        });
      }
    } else if (data.categories) {
      const categoryIds = data.categories.map(category => category.id)
      const categories = await prisma.warehouse.findMany({
        where: {
          id: {
            in: categoryIds
          },
          clientId: req.user.clientId
        }
      })
      if (categories && categoryIds.length === categories.length) next()
      else {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid categories',
        });
      }
    } else {
      return res.status(400).json({
        status: 'fail',
        data: {
          key: 'categories'
        },
        message: 'Please select valid warehouse',
      });
    }
  } catch (e) {
    console.error("Err: ", e);
    return res.status(400).json({
      success: false,
      message: 'Failed to validate warehouse data'
    })
  }

}

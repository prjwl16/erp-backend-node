import { Router } from 'express'
import prisma from '../prisma.js'

const createTag = async (req, res) => {
  try {
    const { name } = req.body
    const tag = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        tags: {
          create: {
            name,
          },
        },
      },
    })
    res.status(201).json(tag)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Opps..! It's not you, it's us. Please try again later." })
  }
}

const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.product.findMany()
    res.status(200).json(tags)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Opps..! It's not you, it's us. Please try again later." })
  }
}

const createProductType = async (req, res) => {
  try {
    const { name } = req.body
    const productType = await prisma.productType.create({
      data: {
        name,
        clientId: req.user.clientId,
      },
    })
    res.status(201).json(productType)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Opps..! It's not you, it's us. Please try again later." })
  }
}

const utilsController = Router()
utilsController.post('/create-productType', createProductType)

export default utilsController

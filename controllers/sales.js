import { Router } from 'express'
import prisma from '../prisma.js'
import { invalidRequest, serverError, success } from '../utils/response.js'
import multer from 'multer'
import * as xlsx from 'node-xlsx'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const salesRouter = Router()

const createSales = async (req, res) => {
  try {
    // check warehouse exists
    const warehouse = await prisma.warehouse.findFirst({
      where: {
        id: req.body.warehouseId,
        clientId: req.user.clientId,
      },
    })

    if (!warehouse) {
      return invalidRequest(res, 'Warehouse does not exist')
    }

    // add sales
    const newSales = await prisma.Sales.create({
      data: {
        amount: req.body.amount,
        productName: req.body.productName,
        customerName: req.body.customerName,
        customerPhone: req.body?.customerPhone || '',
        warehouse: {
          connect: {
            id: req.body.warehouseId,
          },
        },
        Client: {
          connect: {
            id: req.user.clientId,
          },
        },
        createdBy: {
          connect: {
            id: req.user.id,
          },
        },
      },
    })

    return success(res, { sales: newSales }, 'Sales created successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to create the sales')
  }
}

const getSales = async (req, res) => {
  try {
    const sales = await prisma.Sales.findMany({
      where: {
        clientId: req.user.clientId,
      },
    })

    return success(res, { sales }, 'Sales retrieved successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to retrieve the sales')
  }
}

const addBulkEntries = async (req, res) => {
  // file parsing logic
  // read excel file
  // loop through headers
  // file object
  // parse the file
  try {
    if (!req.file) return invalidRequest(res, 'Please provide an excel file')

    const fileBuffer = req.file.buffer // file buffer
    const workSheetsFromBuffer = xlsx.parse(fileBuffer)

    const data = []

    workSheetsFromBuffer.map((value, index) => {
      value?.data.map((row, index) => {
        // log headers on a single line
        if (row.length <= 0) return
        if (index !== 0) {
          data.push({
            srNo: row[0],
            billNo: row[1],
            customerName: row[2],
            productName: row[3],
            amount: row[4],
            warehouse: row[5],
            return: row[6],
            returnWarehouse: row[7],
          })
        }
      })
    })

    console.log(data)

    return success(res, {}, 'Bulk entries added successfully')
  } catch (error) {
    console.log(error)
    return serverError(res, 'Failed to add bulk entries')
  }
}

salesRouter.post('/', createSales)
salesRouter.get('/', getSales)
salesRouter.post('/bulk', upload.single('excel'), addBulkEntries)

export default salesRouter

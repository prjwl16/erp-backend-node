//convert to require

import { getUserDetails } from '../models/user.js'
import jwt from 'jsonwebtoken'
import { invalidRequest } from '../utils/response.js'

export const verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const token = bearer[1]
    if (!token) return invalidRequest(res, 'Invalid token provided', 403)
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET)
      if (typeof data === 'string') throw Error('Invalid token provided')
      const user = await getUserDetails(data.id)
      if (!user) throw Error('User not found')
      req.user = user
    } catch (error) {
      console.log('error : ', error.message)
      return invalidRequest(res, 'Invalid token provided', 403)
    }
    next()
  } else {
    return invalidRequest(res, 'Unauthorized', 403)
  }
}

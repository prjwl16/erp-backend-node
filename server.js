import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import router from './controllers/index.js'

dotenv.config()

// accept all origins
const corsOptions = {
  origin: '*',
}

const app = express()
app.use(cors(corsOptions))
app.use(express.json())

//Routes

app.use('/api', router)

app.get('/', (req, res) => {
  console.log('GET /', req.query)
  res.send('Hello World!')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

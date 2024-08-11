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

router.get('/cal', (req, res) => {
  console.log(req.query)
  res.send('Hello GET')
})

router.post('/cal', (req, res) => {
  console.log(req.body)
  res.send('Hello')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

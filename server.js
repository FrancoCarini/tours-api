const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({path: './config/config.env'})

// Routes
const tourRouter = require('./routes/tours')
const userRouter = require('./routes/users')

const app = express()

// Morgan Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Body Parser
app.use(express.json())

// DB Connect
mongoose.connect(process.env.DATABASE, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB'))



// Mount Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
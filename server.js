const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const AppError = require('./utils/appError')
const errorHandler = require('./controllers/errors')

dotenv.config({path: './config/config.env'})

// Routes
const tourRouter = require('./routes/tours')
const userRouter = require('./routes/users')

const app = express()

process.on('uncaughtException', err => {
  console.log(err.name, err.message)
  console.log('UNHANDLED EXCEPTION! Shutting down ...')
  process.exit(1)
})

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

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404))
})

app.use(errorHandler)

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});


process.on('unhandledRejection', err => {
  console.log(err.name, err.message)
  console.log('UNHANDLED REJECTION! Shutting down ...')
  server.close(() => {
    process.exit(1)
  })
})
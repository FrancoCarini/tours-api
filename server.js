const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const AppError = require('./utils/appError')
const errorHandler = require('./controllers/errors')

dotenv.config({path: './config/config.env'})

// Routes
const tourRouter = require('./routes/tours')
const userRouter = require('./routes/users')

const app = express()

// Helmet security http headers
app.use(helmet())

process.on('uncaughtException', err => {
  console.log(err.name, err.message)
  console.log('UNHANDLED EXCEPTION! Shutting down ...')
  process.exit(1)
})

// Morgan Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Rate Limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour'
})

app.use('/api', limiter)

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

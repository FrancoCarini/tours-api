const path = require('path')
const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const expressLayouts = require('express-ejs-layouts')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')
const errorHandler = require('./controllers/errors')


dotenv.config({path: './config/config.env'})

// Routes
const tourRouter = require('./routes/tours')
const userRouter = require('./routes/users')
const reviewRouter = require('./routes/reviews')
const viewRouter = require('./routes/views')

const app = express()

// Body Parser
app.use(express.json({limit: '10kb'}))

// Cookie Parser
app.use(cookieParser())

// Use Express Layouts
app.use(expressLayouts);

// Template Engines
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set Layout
app.set('layout', 'layouts/layout');

// Static Files
app.use(express.static(path.join(__dirname,'public')))

// CORS
app.use(cors())

// Helmet security http headers
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", 'https:', 'http:','data:', 'ws:'],
    baseUri: ["'self'"],
    fontSrc: ["'self'", 'https:','http:', 'data:'],
    scriptSrc: [
      "'self'",
      'https:',
      'http:',
      'blob:',
      'https://*.cloudflare. com'],
    styleSrc: ["'self'", 'https:', 'http:','unsafe-inline']
  }
}))

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

// Data sanitization against NoSql query Injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// HPP Http Parameter Pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingQuantity',
    'ratingsAverage',
    'difficulty',
    'maxGroupSize',
    'price'
  ]
}))

// DB Connect
mongoose.connect(process.env.DATABASE, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB'))

// Mount Routes
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)


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

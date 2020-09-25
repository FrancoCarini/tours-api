const AppError = require('../utils/appError')

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data: ${errors.join('. ')}`
  return new AppError(message, 400)
}

const getKeyValues = (obj) => {
  const entries = Object.entries(obj)
  let msg = '';
  entries.forEach(entry => msg+= `${entry[0]}: ${entry[1]} `)
  return msg.trim()
}

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // A: API
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    })
  }
  
  // B: Render website
  return res.status(err.statusCode).render('error', {
    msg: err.message
  })
}

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // A: API
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    }
    
    // A-1: Unknown error
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    })
    
  }
  
  if (err.isOperational) {
    // B: Render website
    return res.status(err.statusCode).render('error', {
      msg: err.message
    })
  } 
  
  // B-1: Unknown error
  return res.status(err.statusCode).render('error', {
    msg: 'Please try again later.'
  })
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err}
    error.name = err.name
    error.message = err.message
    if (error.name === 'CastError') error = new AppError(`Invalid ${error.path}: ${error.value}.`, 400)
    if (error.code === 11000) { 
      const keyValueDuplicated = getKeyValues(error.keyValue)
      error = new AppError(`Duplicate Field ${keyValueDuplicated}`, 400)
    }
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = new AppError('Invalid Token. Please login again.', 401)
    if (error.name === 'TokenExpiredError') error = new AppError('Token Expired. Please login again.', 401)
    sendErrorProd(error, req, res)
  }
}

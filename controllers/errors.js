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

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  })
}

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    // Unknown error
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err}
    error.name = err.name
    if (error.name === 'CastError') error = new AppError(`Invalid ${error.path}: ${error.value}.`, 400)
    if (error.code === 11000) { 
      const keyValueDuplicated = getKeyValues(error.keyValue)
      error = new AppError(`Duplicate Field ${keyValueDuplicated}`, 400)
    }
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    sendErrorProd(error, res)
  }
}
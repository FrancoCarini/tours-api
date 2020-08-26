const crypto = require('crypto')
const { promisify } = require('util')
const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const {name, email, password, passwordConfirm}  = req.body
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm
  })

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
})

exports.login = async (req, res, next) => {
  const {email, password} = req.body

  // Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide and email and a password', 400))
  }

  // Check if user exists and password is correct
  const user = await User.findOne({email}).select('+password')
  if (!user) {
    return next(new AppError('Incorrect email or password', 401))
  }

  const correct = await user.correctPassword(password, user.password)
  if (!correct) {
    return next(new AppError('Incorrect email or password', 401))
  }

  const token = signToken(user._id)
  res.status(200).json({
    status: 'success',
    token
  })
}

exports.protect = catchAsync(async (req, res, next) => {
  // Get token and check if exists
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('Your are not logged in. Please login to get access', 401))
  }

  // Verify Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // Check if user exists
  const user = await User.findById(decoded.id)

  if (!user) {
    return next(new AppError('User does not exists'), 401)
  }

  // Check if user changes password after the token was issued
  if (user.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password. Please login again.', 401))
  }

  // Grant access to protected route
  req.user = user
  next()
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an Array EX: ['admin', 'guide']
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You dont have permission to perform this action', 403))
    }
    next()
  }
}

exports.forgotPassword = catchAsync(async(req, res, next) => {
  // Get User based on posted email
  const user = await User.findOne({email: req.body.email})
  if (!user) {
    return next(new AppError('User does not exists', 404))
  }
  
  // Generate random token
  const resetToken = user.createPasswordResetToken()

  await user.save({
    validateBeforeSave: false
  })

  // Send it as an email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to ${resetUrl}.`
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message
    })
    
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({
      validateBeforeSave: false
    })
    return next(new AppError('There was an error sending the email. Try again!', 500))
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  // If token has not expired and theres a user set new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gte: Date.now()}
  })

  if (!user) {
    return next(new AppError('No user with that token or token has expired', 400))
  }

  // Update changedPassword Property for the current user
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // Log the user in
  const token = signToken(user._id)
  res.status(200).json({
    status: 'success',
    token
  })
})

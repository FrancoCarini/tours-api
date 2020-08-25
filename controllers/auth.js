const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')

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
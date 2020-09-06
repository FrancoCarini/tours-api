const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowedFields) => {
  const newObject = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObject[el] = obj[el]
    }
  })
  return newObject
}

exports.updateMe = catchAsync(async(req, res, next) => {
  // Create error if password fields are in body
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for updating password', 400))
  }

  // Filter fields
  const filteredBody = filterObj(req.body, 'name', 'email')

  // Update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    data: updatedUser
  })
})

exports.deleteMe = catchAsync(async(req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false})

  res.status(204).json({
    status: 'success',
    data: null
  })
})

exports.getAllUsers = catchAsync(async(req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    status: 'success',
    data: users
  })
})


exports.deleteUser = factory.deleteOne(User)

// Do not update passwords with this
exports.updateUser = factory.updateOne(User)

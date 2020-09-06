const express = require('express')
const router = express.Router()
const {
  updateMe,
  deleteMe,
  getAllUsers,
  deleteUser
} = require('../controllers/users')

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect
} = require('../controllers/auth')

router.post('/signup', signup)
router.post('/login', login)

router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.patch('/updateMyPassword', protect, updatePassword)

router.patch('/updateMe', protect, updateMe)

router.delete('/deleteMe', protect, deleteMe)

router.get('/', getAllUsers)

router
  .route('/:id')
  .delete(deleteUser)

module.exports = router

const express = require('express')
const router = express.Router()

const {
  updateMe,
  deleteMe,
  getAllUsers,
  deleteUser,
  getMe,
  getUser,
  updateUser,
  uploadUserPhoto,
  resizeUserPhoto
} = require('../controllers/users')

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout
} = require('../controllers/auth')

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)

router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.use(protect)

router.patch('/updateMyPassword', updatePassword)

router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe)

router.delete('/deleteMe', deleteMe)

router.get('/me', getMe, getUser)

router.use(restrictTo('admin'))

router.get('/', getAllUsers)

router
  .route('/:id')
  .get(getUser)
  .delete(deleteUser)
  .patch(updateUser)

module.exports = router

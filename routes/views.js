const express = require('express')
const router = express.Router()

const { 
  getOverview, 
  getTour,
  getLoginForm,
  getAccount } = require('../controllers/views') 

const {
  isLoogedIn,
  protect
} = require('../controllers/auth')


router.get('/', isLoogedIn, getOverview)

router.get('/tours/:slug', isLoogedIn, getTour)

router.get('/login', isLoogedIn, getLoginForm)

router.get('/me', protect, getAccount)

module.exports = router

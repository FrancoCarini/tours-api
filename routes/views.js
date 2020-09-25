const express = require('express')
const router = express.Router()

const { 
  getOverview, 
  getTour,
  getLogin } = require('../controllers/views') 

const {
  isLoogedIn
} = require('../controllers/auth')

router.use(isLoogedIn)

router.get('/', getOverview)

router.get('/tours/:slug', getTour)

router.get('/login', getLogin)

module.exports = router

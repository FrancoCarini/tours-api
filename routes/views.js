const express = require('express')
const router = express.Router()

const { getOverview, getTour } = require('../controllers/views') 

router.get('/', getOverview)

router.get('/tours/:slug', getTour)

module.exports = router

const express = require('express')
const router = express.Router()
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
} = require('../controllers/tours')

router.get('/top-5-cheap', aliasTopTours, getAllTours)

router.get('/tour-stats',getTourStats)
router.get('/monthly-plan/:year',getMonthlyPlan)

router
  .route('/')
  .get(getAllTours)
  .post(createTour)

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour)

module.exports = router
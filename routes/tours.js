const express = require('express')
const router = express.Router()
const reviewRouter =  require('../routes/reviews')

router.use('/:tourId/reviews', reviewRouter)

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = require('../controllers/tours')

const { protect, restrictTo } = require('../controllers/auth')

router.get('/top-5-cheap', aliasTopTours, getAllTours)

router.get('/tour-stats',getTourStats)
router.get('/monthly-plan/:year', protect, restrictTo('admin','lead-guide', 'guide'),getMonthlyPlan)

router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursWithin)

router.get('/distances/:latlng/unit/:unit', getDistances)

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin','lead-guide'),createTour)

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin','lead-guide'), updateTour)
  .delete(protect, restrictTo('admin'), deleteTour)

module.exports = router

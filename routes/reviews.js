const express = require('express')

const router = express.Router({mergeParams: true})

const {
  createReview,
  getAllReviews,
  deleteReview
} = require('../controllers/reviews')

const { protect, restrictTo } = require('../controllers/auth')

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'),createReview)

router
  .route('/:id')
  .delete()

module.exports = router

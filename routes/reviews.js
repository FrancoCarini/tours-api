const express = require('express')

const router = express.Router({mergeParams: true})

const {
  createReview,
  getAllReviews,
  deleteReview,
  setTourUserIds,
  getReview
} = require('../controllers/reviews')

const { protect, restrictTo } = require('../controllers/auth')

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds,createReview)

router
  .route('/:id')
  .get(getReview)
  .delete(deleteReview)

module.exports = router

const express = require('express')

const router = express.Router({mergeParams: true})

const {
  createReview,
  getAllReviews,
  deleteReview,
  setTourUserIds,
  getReview,
  updateReview
} = require('../controllers/reviews')

const { protect, restrictTo } = require('../controllers/auth')

router.use(protect)

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds,createReview)

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)

module.exports = router

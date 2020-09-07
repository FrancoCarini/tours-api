const Tour = require('../models/Tour')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = 'price'
  next()
}

exports.getAllTours = factory.getAll(Tour)

exports.createTour = factory.createOne(Tour)

exports.getTour = factory.getOne(Tour, { path: 'reviews' })

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour)

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {ratingsAverage: {$gt: 4}}
    },
    {
      $group: {
        _id: '$difficulty',
        num: {$sum: 1},
        avgRating: {$avg: '$ratingsAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: {$min: '$price'},
        maxPrice: {$max: '$price'}
      }
    },
    {
      $sort: {_id: -1}
    },
    {
      $match: {_id: 'easy'}
    }
  ])
    
  res
    .status(200)
    .json({
      status: 'success',
      data: stats
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year)
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStart: { $sum: 1 },
        tours: {$push: '$name'}
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numToursStart: -1 }
    },
    {
      $limit: 3
    }
  ])

  res
    .status(200)
    .json({
      status: 'success',
      data: plan
    })
})

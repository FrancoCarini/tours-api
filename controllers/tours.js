const Tour = require('../models/Tour')
const ApiFeatures = require('../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('../utils/appError')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = 'price'
  next()
}

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const tours = await features.query

  res
    .status(200)
    .json({
      status: 'success',
      results: tours.length,
      data: tours
    })
})



exports.createTour = catchAsync(async(req, res, next) => {
  const newTour = await Tour.create(req.body)
  res
    .status(201)
    .json({
      'status': 'success',
      'data': newTour
    })
})

exports.getTour = catchAsync(async(req, res, next) => {
  const tour = await Tour.findById(req.params.id)

  if (!tour) {
    return next(new AppError(`No tour with id ${req.params.id}`, 404))
  }

  res
  .status(200)
  .json({
    'status': 'success',
    'data': tour
  })
})

exports.updateTour = catchAsync(async(req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
    new: true,
    runValidators: true
  })

  if (!tour) {
    return next(new AppError(`No tour with id ${req.params.id}`, 404))
  }
    
  res
    .status(200)
    .json({
      status: 'success',
      data: tour
    })
})

exports.deleteTour = catchAsync(async(req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)

  if (!tour) {
    return next(new AppError(`No tour with id ${req.params.id}`, 404))
  }
  
  res
    .status(200)
    .json({
      status: 'success',
      data: null
    })
})

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
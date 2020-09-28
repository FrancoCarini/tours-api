const Tour = require('../models/Tour')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')
const multer = require('multer')
const sharp = require('sharp')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next()

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${req.body.imageCover}`)

  // 2) Images
  req.body.images = []
  await Promise.all(req.files.images.map(async (file, i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

    await sharp(file.buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${filename}`)

    req.body.images.push(filename)
  }))
  next()
})

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const {distance, unit, latlng} = req.params
  const [lat, lng] = latlng.split(',')

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

  if (!lat || !lng) {
    next(new AppError('Please provide Latitude and Longitude in format -40.3389,45.4546', 400))
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  })

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours
  })
})

exports.getDistances = catchAsync(async (req, res, next) => {
  const {unit, latlng} = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) {
    next(new AppError('Please provide Latitude and Longitude in format -40.3389,45.4546', 400))
  }

  // Meters to Km o Mi
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ])

  res.status(200).json({
    status: 'success',
    data: distances
  })
})

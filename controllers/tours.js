const Tour = require('../models/Tour')
const ApiFeatures = require('../utils/apiFeatures')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = 'price'
  next()
}

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err
    })
  }
}

exports.createTour = async(req, res) => {
  try {
    const newTour = await Tour.create(req.body)
  res
    .status(201)
    .json({
      'status': 'success',
      'data': newTour
    })
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    })
  }
}

exports.getTour = async(req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)

    res
    .status(200)
    .json({
      'status': 'success',
      'data': tour
    })
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    })
  }
}

exports.updateTour = async(req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
      new: true,
      runValidators: true
    })
    res
      .status(200)
      .json({
        status: 'success',
        data: tour
      })
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    })
  }
}

exports.deleteTour = async(req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)
    res
      .status(200)
      .json({
        status: 'success',
        data: null
      })
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    })
  }
}

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err
    })
  }
}
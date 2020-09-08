const mongoose = require('mongoose')
const Tour = require('./Tour')

const ReviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty.']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
})

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true })

ReviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  next()
})

ReviewSchema.statics.calcAverageRatings = async function(tourId) {
  // static function 'this' points to the model
  const stats = await this.aggregate([
    {
      $match: {tour: tourId}
    },
    {
      $group: {
        _id: '$tour',
        nRating: {$sum: 1},
        avgRating: {$avg: '$rating'}
      }
    }
  ])

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}

ReviewSchema.post('save', async function() {
  // Here 'this' point to current review

  // this.constructor gave us the model since we are
  // calling a static function we need to call it using Review
  await this.constructor.calcAverageRatings(this.tour)
})

// findByIdAndUpdate
// findByIdAndDelete
ReviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne()
  next()
})

ReviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

module.exports = mongoose.model('Review', ReviewSchema)

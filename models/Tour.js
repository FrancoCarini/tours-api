const mongoose = require('mongoose')
const slugify = require('slugify')

const TourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'Please do not exceed 40 characters'],
    minlength: [10, 'Please use more than 9 characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be: easy, medium or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    min: [1, 'Rating must be higher than 1'],
    max: [5, 'Rating must be lower than 5']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        return val < this.price
      },
      message: 'Discount price must be lower than the regular price'
    }
  },
  summary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description']
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have an image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date]
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
}) 

TourSchema.virtual('durationWeeks').get(function(){
  return this.duration / 7
})

TourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

module.exports = mongoose.model('Tour', TourSchema)
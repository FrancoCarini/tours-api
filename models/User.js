const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us youn name']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password
      },
      message: 'Password must match'
    }
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
})

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

UserSchema.pre('save', function(next){
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangeAt = Date.now() - 1000
  next()
})

UserSchema.pre(/^find/, function(next) {
  // If query starts with find (findById, findByIdAndUpdate)
  // this point to the current query
  this.find({active: {$ne: false}})
  next()
})

UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

UserSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10)
    return changedTimestamp > JWTTimestamp
  }
  return false
}

UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}

module.exports = mongoose.model('User', UserSchema)

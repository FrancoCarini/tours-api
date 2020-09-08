const fs = require('fs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({path: './config/config.env'})

// Models
const User = require('./models/User')
const Tour = require('./models/Tour')
const Review = require('./models/Review')

// DB Connect
mongoose.connect(process.env.DATABASE, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB'))

// read JSON file
const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'))
const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours3.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8'))

// Import data into database
const importData = async () => {
  try {
    await User.create(users)
    await Tour.create(tours)
    await Review.create(reviews)
    console.log('Data Imported!')
    process.exit()
  } catch (err) {
    console.log(err)  
  }
}

// Delete Data from collection
const deleteData = async () => {
  try {
    await User.deleteMany()
    await Tour.deleteMany()
    await Review.deleteMany()
    console.log('Data Deleted!')
    process.exit()
  } catch (err) {
    console.log(err)  
  }
}

if(process.argv[2] === '-i') {
  importData()
} else if(process.argv[2] === '-d') {
  deleteData()
}

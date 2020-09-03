const fs = require('fs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({path: './config/config.env'})

// Models
const Tour = require('./models/Tour')

// DB Connect
mongoose.connect(process.env.DATABASE, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB'))

// read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/newTours.json`, 'utf-8'))

// Import data into database
const importData = async () => {
  try {
    await Tour.create(tours)
    console.log('Data Imported!')
    process.exit()
  } catch (err) {
    console.log(err)  
  }
}

// Delete Data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany()
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

const express = require('express')
const morgan = require('morgan')

// Routes
const tourRouter = require('./routes/tours')
const userRouter = require('./routes/users')

const app = express()

app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({'message': `Hellooooo!`})
})

// Mount Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
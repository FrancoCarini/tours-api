const express = require('express')

const app = express()
const morgan = require('morgan')

app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({'message': `Hellooooo!`})
})

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const router = require('./router')

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.use(fileUpload())

app.use('/api', router)

app.use('/static', express.static('resume-uploads'))

app.use('/', express.static('client'))

app.listen(process.env.PORT, ()=> {
    console.log('Server running at port 3000')
})

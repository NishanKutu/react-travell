const express = require('express')
require('dotenv').config()
require('./db/connection')
const morgan = require('morgan')
const cors = require('cors')

const UserRoute = require('./routes/userRoute')


const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())




app.get('/',(req, res)=>{
    res.send("SERVER IS RUNNING")
})

app.use('/api', UserRoute)


const port = process.env.PORT || 5000

app.listen(port, ()=>{
    console.log(`APP STARTED SUCCESSFULLY AT PORT ${port}`)
})
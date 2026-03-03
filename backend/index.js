const express = require('express')
const path = require('path');
require('dotenv').config()
require('./db/connection')
const morgan = require('morgan')
const cors = require('cors')

const UserRoute = require('./routes/userRoute')
const destinationRoutes = require("./routes/destinationRoutes");
const bookingRoutes = require("./routes/bookingRoute");
const reviewRoute = require("./routes/reviewRoute");
const faqRoute = require("./routes/faqRoute");



const app = express()

app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(morgan('dev'))
app.use(cors())

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.get('/',(req, res)=>{
    res.send("SERVER IS RUNNING")
})

app.use('/api/user', UserRoute)
app.use('/api/destinations', destinationRoutes)
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoute);
app.use("/api/faqs", faqRoute);


const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log(`APP STARTED SUCCESSFULLY AT PORT ${port}`)
})
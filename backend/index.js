const express = require('express')
const path = require('path');
require('dotenv').config()
const databaseConnection = require('./db/connection')
const morgan = require('morgan')
const cors = require('cors')

const UserRoute = require('./routes/userRoute')
const destinationRoutes = require("./routes/destinationRoutes");
const bookingRoutes = require("./routes/bookingRoute");
const reviewRoute = require("./routes/reviewRoute");
const faqRoute = require("./routes/faqRoute");
const activityRoute = require("./routes/activityRoute");     // For activities like "Sunrise View"
const customTourRoute = require("./routes/customTourRoute"); // For saving user itineraries
const cityRoute = require("./routes/cityRoute");             // For dynamic cities/destinations
const messageRoute = require("./routes/messageRoute");



const app = express()

app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use((error, _req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ error: 'Invalid JSON payload' })
    }

    next(error)
})
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
app.use("/api/activities", activityRoute);     // Used by AddActivity.jsx and CustomTour.jsx
app.use("/api/custom-tours", customTourRoute); // Used to save the final itinerary
app.use("/api/cities", cityRoute); // Used to populate dynamic city dropdowns
app.use("/api/messages", messageRoute);



const port = process.env.PORT || 8000

databaseConnection
    .then(() => {
        app.listen(port, ()=>{
            console.log(`APP STARTED SUCCESSFULLY AT PORT ${port}`)
        })
    })
    .catch((error) => {
        console.error("APP FAILED TO START: database connection unavailable")
        console.error(error.message)
        process.exit(1)
    })

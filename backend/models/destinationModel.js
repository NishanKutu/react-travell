const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    
    // --- Overview Section ---
    title: {
        type: String,
        required: [true, "Please provide a title"],
        trim: true
    },
    images: [{
        type: String,
        // required: true
    }],
    descriptions: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: [true, "Please provide a price"]
    },
    duration: {
        type: String, 
        required: true
    },
    discount: {
        type: Number, 
        default: 0
    },
    groupSize: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'not-active'],
        default: 'active'
    },
    availability: [{
        type: String,
        enum: ['Autumn', 'Spring', 'Winter', 'Monsoon'],
        required: true
    }],
    isBestSeller: {
        type: Boolean,
        default: false
    },
    isNewTrip: {
        type: Boolean,
        default: false
    },
    isPromo: {
        type: Boolean,
        default: false
    },


    // --- Itinerary Section ---
    itinerary: [{
        day: { type: Number, required: true },
        title: { type: String, required: true },
        descriptions: { type: String, required: true }
    }],

    // --- Inclusions Section ---
    inclusions: {
        included: [{ type: String }],
        notIncluded: [{ type: String }]
    }

}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
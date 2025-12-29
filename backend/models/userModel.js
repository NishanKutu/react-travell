const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0
        // 0-normal user, 1-admin
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)

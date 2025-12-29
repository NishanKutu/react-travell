const UserModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const saltRounds = 10
const TokenModel = require('../models/tokenModel')
const crypto = require('crypto')
const emailSender = require('../utils/emailSender')

const jwt = require('jsonwebtoken')

// register
exports.register = async (req, res) => {
    let { username, email, password } = req.body

    let usernameExists = await UserModel.findOne({ username })
    if (usernameExists) {
        return res.status(400).json({ error: "Username not available" })
    }

    let emailExists = await UserModel.findOne({ email })
    if (emailExists) {
        return res.status(400).json({ error: "Email already registered." })
    }

    let salt = await bcrypt.genSalt(saltRounds)
    console.log(salt)
    let hashed_password = await bcrypt.hash(password, salt)

    let userToRegister = await UserModel.create({
        username,
        email,
        password: hashed_password
    })

    if (!userToRegister) {
        return res.status(400).json({ error: "Something went wrong" })
    }
    let tokenToSend = await TokenModel.create({
        token: crypto.randomBytes(24).toString('hex'),
        user: userToRegister._id
    })
    if (!tokenToSend) {
        return res.status(400).json({ error: "Failed to generate token" })
    }

    const URL = `${process.env.FRONTEND_URL}/verify/${tokenToSend.token}`
    emailSender({
        from: 'noreply@something.com',
        to: email,
        subject: 'Email Verification',
        text: 'Click on the following link to verify your account',
        html: `<a href='${URL}'><button>Verify Now</button></a>`
    })

    res.send({ userToRegister, success: true, message: "User registered successfully." })
}

exports.verifyEmail = async (req, res) => {
    let tokenToVerify = await TokenModel.findOne({ token: req.params.token })
    if (!tokenToVerify) {
        return res.status(400).json({ error: "Invalid token or token may have expired" })
    }
    let userToVerify = await UserModel.findById(tokenToVerify.user)
    if (!userToVerify) {
        return res.status(400).json({ error: "User not found." })
    }
    if (userToVerify.isVerified) {
        return res.status(400).json({ error: "User already verified" })
    }
    userToVerify.isVerified = true
    userToVerify = await userToVerify.save()
    if (!userToVerify) {
        return res.status(400).json({ error: "Failed to verify. Try again later" })
    }
    res.send({ success: true, message: "User verified successfully." })
}

exports.resendVerification = async (req, res) => {
    let userToVerify = await UserModel.findOne({ email: req.body.email })
    if (!userToVerify) {
        return res.status(400).json({ error: "Email not registered" })
    }
    if (userToVerify.isVerified) {
        return res.status(400).json({ error: "User already verified." })
    }
    let tokenToSend = await TokenModel.create({
        user: userToVerify._id,
        token: crypto.randomBytes(16).toString('hex')
    })
    if (!tokenToSend) {
        return res.status(400).json({ error: "Faile to generate token. Try again later." })
    }
    const URL = `${process.env.FRONTEND_URL}/verify/${tokenToSend.token}`
    emailSender({
        from: `noreply@something.com`,
        to: userToVerify.email,
        subject: "Verification Email",
        text: "Click on the following link to verify your email",
        html: `<a href='${URL}'><button>Verify Email</button></a>`
    })
    res.send({ success: true, message: "verification link has been sent to your email." })
}
// forget password
exports.forgetPassword = async (req, res) => {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
        return res.status(400).json({ error: "Email not registered" })
    }
    let tokenToSend = await TokenModel.create({
        user: user._id,
        token: crypto.randomBytes(16).toString('hex')
    })
    if (!tokenToSend) {
        return res.status(400).json({ error: "Something went wrong." })
    }
    const URL = `${process.env.FRONTEND_URL}/resetpassword/${tokenToSend.token}`

    emailSender({
        from: `noreply@somethig.com`,
        to: req.body.email,
        subject: `Password reset link`,
        text: `click on the following link to  reset your meail`,
        html: `<a href='${URL}'><button>Forget Password</button></a>`
    })

    res.send('message: "Password reset link has been sent to your email')
}

// reset password
exports.resetPassword = async (req, res) => {
    let token = await TokenModel.findOne({ token: req.params.token })
    if (!token) {
        return res.status(400).json({ error: "Invalid token or token may have expired" })
    }
    let user = await UserModel.findById(token.user)
    if (!user) {
        return res.status(400).json({ error: "Something went wrong" })
    }
    let salt = await bcrypt.genSalt(saltRounds)
    let hashed_password = await bcrypt.hash(req.body.password, salt)
    user.password = hashed_password
    user = await user.save()

    return res.send({ message: " password reset successfully " })
}


// login
exports.login = async (req, res) => {
    const { email, password } = req.body
    let user = await UserModel.findOne({ email })
    if (!user) {
        return res.status(400).json({ error: "User not registered" })
    }
    let passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
        return res.status(400).json({ error: "Email and password do not match." })
    }
    if (!user.isVerified) {
        return res.status(400).json({ error: "User not verified." })
    }
    let token = jwt.sign({
        _id: user._id,
        email,
        username: user.username,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '24h' })

    res.send({
        success: true, token, message: "Logged in successfully", user: {
            _id: user._id,
            email,
            username: user.username,
            role: user.role
        }
    })
}
// get all users
exports.getAllUsers = async (req, res) => {
    let users = await UserModel.find()
    if (!users) {
        return res.status(400).json({ error: "Something went wrong" })
    }
    res.send(users)
}

// get user details
exports.getUserDetails = async (req, res) => {
    let user = await UserModel.findById(req.params.id)
    if (!user) {
        return res.status(400).json({ error: "Something went wrong" })
    }
    res.send(user)
}


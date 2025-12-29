const { register, verifyEmail, resendVerification, forgetPassword, resetPassword, login, getAllUsers, getUserDetails } = require('../controllers/userController')
const { isAdmin } = require('../middleware/authMiddleware')
const { userRegisterRules, validationMethod } = require('../middleware/validationScript')
const router = require('express').Router()


router.post('/register', userRegisterRules, validationMethod, register)
router.get('/verify/:token', verifyEmail)
router.post('/resendverification', resendVerification)
router.post('/forgetpassword', forgetPassword)
router.post('/resetpassword/:token', resetPassword)
router.post('/login', login)
router.get('/getallusers', isAdmin, getAllUsers)
router.get('/getuserdetails/:id', isAdmin, getUserDetails)

module.exports = router
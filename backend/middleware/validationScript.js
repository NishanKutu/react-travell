const { check, validationResult } = require('express-validator')

exports.validationMethod = (req, res, next) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg })
    }
    next()
}

exports.userRegisterRules = [
    check('username', 'Username is required').notEmpty().isLength({ min: 3 }).withMessage("username must be at least 3 characters")
    .not()
    .isIn(['test','admin','password']).withMessage("THIS USERNAME IS NOT ALLOWED")
    
    ,
    check('email', "Email is required").notEmpty().isEmail().withMessage("Email format incorrect"),
    check('password', "Password is required").notEmpty()
        .matches(/[a-z]/).withMessage("Password must contain at least 1 lowercase alphabet")
        .matches(/[A-Z]/).withMessage("Password must contain at least 1 uppercase alphabet")
        .matches(/[0-9]/).withMessage("Password must contain at least 1 number")
        .matches(/[!@#$%^&]/).withMessage("Password must contain at least 1 special character")
        .isLength({min: 8}).withMessage("Password must be at least 8 characters")
        .isLength({max: 15}).withMessage("Password must not exceed 15 characters")
]
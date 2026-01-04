let UserModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

exports.isLoggedIn = async (req, res, next) => {
    let token = await req.headers["authorization"]
    if (!token) {
        return res.status(401).json({ error: "Login token not found" })
    }
    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    let user = await UserModel.findById(decoded._id)
    if (!user) {
        return res.status(400).json({ error: "Failed to login" })
    }
    next()
}

// exports.isAdmin = async (req, res, next) => {
//     let token = await req.headers["authorization"]
//     if (!token) {
//         return res.status(401).json({ error: "User not logged in" })
//     }
//     let decoded = jwt.verify(token, process.env.JWT_SECRET)
//     let user = await UserModel.findById(decoded._id)
//     // if (!user) {
//     //     return res.status(401).json({ error: "User not logged in" })
//     // }
//     if(user.role !== 1){
//         return res.status(403).json({error:"You must be admin to access this resource"})
//     }
//     next()
// }
exports.isAdmin = async (req, res, next) => {
    try {
        let authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }

        // Handle "Bearer <token>" format
        const token = authHeader.startsWith("Bearer ") 
            ? authHeader.split(" ")[1] 
            : authHeader;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (req.user.role !== 1) {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid Token" });
    }
};
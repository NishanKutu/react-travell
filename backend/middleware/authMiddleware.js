let UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = async (req, res, next) => {
  try {
    let authHeader = req.headers["authorization"];
    if (!authHeader || authHeader === "Bearer null") {
      return res
        .status(401)
        .json({ success: false, message: "Please login to continue" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded._id || decoded.id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again.",
    });
  }
};

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

// const jwt = require("jsonwebtoken");
// const UserModel = require("../models/userModel");

// // Middleware to verify if user is logged in
// exports.isLoggedIn = async (req, res, next) => {
//   try {
//     const authHeader =
//       req.headers["authorization"] || req.headers["Authorization"];

//     // Check if header exists and starts with Bearer
//     if (!authHeader) {
//       return res
//         .status(401)
//         .json({ success: false, message: "No token provided." });
//     }

//     const token = authHeader.startsWith("Bearer ")
//       ? authHeader.split(" ")[1]
//       : authHeader;

//     if (!token || token === "null" || token === "undefined") {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid session. Please login." });
//     }

//     // Verify Token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Fetch user from DB to ensure they still exist and get current role
//     const user = await UserModel.findById(decoded._id || decoded.id).select(
//       "-password"
//     );

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User no longer exists.",
//       });
//     }

//     req.user = user; // Attach user to request object
//     next();
//   } catch (error) {
//     console.error("Auth Error:", error.message);
//     return res.status(401).json({
//       success: false,
//       message: "Session expired. Please login again.",
//     });
//   }
// };

// // Middleware to verify Admin status (Must be used AFTER isLoggedIn)
// exports.isAdmin = async (req, res, next) => {
//   try {
//     // req.user is available because isLoggedIn ran first
//     if (!req.user || req.user.role !== 1) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied. Admin privileges required.",
//       });
//     }
//     next();
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server error during authorization.",
//     });
//   }
// };

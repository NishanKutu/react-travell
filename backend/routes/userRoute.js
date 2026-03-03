const {
  register,
  verifyEmail,
  manualVerifyUser,
  resendVerification,
  forgetPassword,
  resetPassword,
  login,
  getAllUsers,
  getAllGuides,
  getUserDetails,
  deleteUser,
  toggleUserRole,
  updateProfile,
} = require("../controllers/userController");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const {
  userRegisterRules,
  validationMethod,
} = require("../middleware/validationScript");
const router = require("express").Router();
const upload = require("../utils/multer");

router.post(
  "/register",
  upload.single("image"),
  userRegisterRules,
  validationMethod,
  register
);

router.put("/update-profile/:id", isLoggedIn, upload.single("image"), updateProfile);

router.get("/verify/:token", verifyEmail);
router.put("/manual-verify/:id", isLoggedIn, isAdmin, manualVerifyUser);
router.post("/resendverification", resendVerification);
router.post("/forgetpassword", forgetPassword);
router.post("/resetpassword/:token", resetPassword);
router.post("/login", login);
router.get("/getallusers", isLoggedIn, isAdmin, getAllUsers);
router.get("/getallguides", getAllGuides);
router.get("/getuserdetails/:id", isAdmin, getUserDetails);
router.delete("/deleteuser/:id", isAdmin, deleteUser);
router.put("/togglerole/:id", isAdmin, toggleUserRole);

module.exports = router;

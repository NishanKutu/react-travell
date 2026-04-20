const express = require("express");
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/conversations", isLoggedIn, getConversations);
router.get("/:bookingId/:staffRole", isLoggedIn, getMessages);
router.post("/", isLoggedIn, sendMessage);

module.exports = router;

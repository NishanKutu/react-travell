const Booking = require("../models/bookingModel");
const Destination = require("../models/destinationModel");

const crypto = require("crypto");

// 1. Create Initial Booking
exports.createBooking = async (req, res) => {
  console.log("User from middleware:", req.user);
  console.log("User from middleware:", req.user);
  try {
    const { destinationId, travelerCount, totalPrice } = req.body;
    const newBooking = new Booking({
      userId: req.user.id,
      destinationId,
      travelerCount,
      totalPrice,
      status: "pending",
    });
    const savedBooking = await newBooking.save();
    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const query = req.user.role === 1 ? {} : { userId: req.user.id };

    const bookings = await Booking.find(query)
      .populate("userId", "firstName lastName email") // Adjust fields based on your User model
      .populate("destinationId", "title") // Adjust fields based on your Destinations model
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Delete Booking
exports.deleteBooking = async (req, res) => {
  console.log("Delete request received for ID:", req.params.id);
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Initiate Booking and get Signature
exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { amount, productId } = req.body;
    const cleanAmount = String(amount);

    // eSewa Test Credentials (from documentation)

    const secretKey = "8gBm/:&EnhH.1/q";
    const productCode = "EPAYTEST";

    const message = `total_amount=${cleanAmount},transaction_uuid=${productId},product_code=${productCode}`;

    // Generate HMAC-SHA256 Signature
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

    console.log("Generated Message:", message);
    console.log("Generated Signature:", signature);

    res.status(200).json({
      success: true,
      signature,
      product_code: productCode,
      transaction_uuid: productId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify eSewa Payment after redirect
exports.verifyEsewaPayment = async (req, res) => {
  const { data } = req.query; // Base64 encoded string returned by eSewa
  try {
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );

    const transactionUuid = decodedData.transaction_uuid;
    const bookingId = transactionUuid.split('-')[0];

    if (decodedData.status === "COMPLETE") {
      await Booking.findByIdAndUpdate(bookingId, {
        status: "confirmed",
        transactionId: decodedData.transaction_code,
      });
      res.redirect("http://localhost:5173/payment-success?payment=success");
    } else {
      res.redirect("http://localhost:5173/payment-failure");
    }
  } catch (error) {
    res.redirect("http://localhost:5173/payment-failure");
  }
};

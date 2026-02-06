const Booking = require("../models/bookingModel");
const Destination = require("../models/destinationModel");
const crypto = require("crypto");

// 1. Create Initial Booking
exports.createBooking = async (req, res) => {
  try {
    const { destinationId, travelerCount, totalPrice } = req.body;
    const newBooking = new Booking({
      userId: req.user._id, 
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

// 2. Get All Bookings 
exports.getAllBookings = async (req, res) => {
  try {
    const query = req.user.role === 1 ? {} : { userId: req.user._id };

    const bookings = await Booking.find(query)
      .populate("userId", "username email role") 
      .populate("destinationId", "title")
      .sort({ createdAt: -1 });

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
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Initiate eSewa Payment
exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { amount, productId } = req.body;
    const cleanAmount = String(amount);
    const secretKey = "8gBm/:&EnhH.1/q";
    const productCode = "EPAYTEST";

    const message = `total_amount=${cleanAmount},transaction_uuid=${productId},product_code=${productCode}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

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

// Verify eSewa Payment
exports.verifyEsewaPayment = async (req, res) => {
  const { data } = req.query; 
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
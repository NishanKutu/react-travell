const Booking = require("../models/bookingModel");
const crypto = require("crypto");

// 1. Create Initial Booking
exports.createBooking = async (req, res) => {
  console.log("User from middleware:", req.user);
  console.log("User from middleware:", req.user);
  try {
    const { destinationId, travelerCount, totalPrice } = req.body;
    const newBooking = new Booking({
      userId: req.user.id, // From authMiddleware
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

// Initiate Booking and get Signature
exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { amount, productId } = req.body;
    const cleanAmount = String(amount);

    // eSewa Test Credentials (from documentation)
    const secretKey = "8g8M!&8(HdaiT!set";
    const productCode = "EPAYTEST";

    // Message string MUST follow this exact order
    const message = `total_amount=${cleanAmount},transaction_uuid=${productId},product_code=${productCode}`;

    // Generate HMAC-SHA256 Signature
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

    console.log("Generated Message:", message); // Debugging: Check terminal for this
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

    if (decodedData.status === "COMPLETE") {
      await Booking.findByIdAndUpdate(decodedData.transaction_uuid, {
        status: "confirmed",
        transactionId: decodedData.transaction_code,
      });
      res.redirect("http://localhost:5173/dashboard?payment=success");
    } else {
      res.redirect("http://localhost:5173/payment-failure");
    }
  } catch (error) {
    res.redirect("http://localhost:5173/payment-failure");
  }
};

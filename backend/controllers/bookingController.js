const Booking = require("../models/bookingModel");
const Destination = require("../models/destinationModel");
const crypto = require("crypto");

// Create Initial Booking
exports.createBooking = async (req, res) => {
  try {
    const {
      destinationId,
      travelerCount,
      totalPrice,
      hasGuide,
      hasPorter,
      guideCost,
      porterCost,
      guideId,
      porterId,
      bookingDate,
    } = req.body;
    const newBooking = new Booking({
      userId: req.user._id,
      destinationId,
      travelerCount,
      totalPrice,
      hasGuide: hasGuide || false,
      hasPorter: hasPorter || false,
      guideCost: guideCost || 0,
      porterCost: porterCost || 0,
      guideId: hasGuide ? guideId : null,
      porterId: hasPorter ? porterId : null,
      bookingDate: bookingDate,
      status: "pending",
    });
    const savedBooking = await newBooking.save();
    res.status(201).json({ success: true, data: savedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Manual Booking
exports.adminCreateBooking = async (req, res) => {
  try {
    const {
      userId,
      destinationId,
      travelerCount,
      totalPrice,
      hasGuide,
      hasPorter,
      guideCost,
      porterCost,
      guideId,
      porterId,
      bookingDate,
      status,
    } = req.body;

    const newBooking = new Booking({
      userId,
      destinationId,
      travelerCount,
      totalPrice,
      hasGuide,
      hasPorter,
      guideCost,
      porterCost,
      guideId: hasGuide ? guideId : null,
      porterId: hasPorter ? porterId : null,
      bookingDate: bookingDate,
      status: status || "confirmed",
      paymentMethod: "esewa",
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
    let query = {};
    if (req.user.role === 1) {
      // Admin
      query = {};
    } else if (req.user.role === 2) {
      // Guide
      query = { guideId: req.user._id };
    } else if (req.user.role === 3) {
      // Porter
      query = { porterId: req.user._id };
    } else {
      // Client
      query = { userId: req.user._id };
    }

    const bookings = await Booking.find(query)
      .populate("userId", "username email")
      .populate("destinationId", "title price location")
      .populate("guideId", "username image")
      .populate("porterId", "username image maxWeight")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: booking,
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
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Booking deleted successfully" });
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
    const bookingId = transactionUuid.split("-")[0];

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

exports.cancelAndRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Prevents double-refunding or cancelling finished trips
    if (["refunded", "cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot refund a booking that is already ${booking.status}`,
      });
    }

    // If the booking was confirmed (paid via eSewa/Stripe)
    if (booking.status === "confirmed") {
      const cancellationFeePercent = 20;
      const deduction = (booking.totalPrice * cancellationFeePercent) / 100;
      const refundAmount = booking.totalPrice - deduction;

      booking.status = "refunded";
      booking.refundAmount = refundAmount; // Ensure this is in your Schema

      await booking.save();

      return res.status(200).json({
        success: true,
        message: `Refund Processed: 20% (NPR ${deduction}) fee deducted.`,
        data: {
          refundAmount,
          status: booking.status,
        },
      });
    }

    // Default: If it was 'pending', just mark as cancelled
    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Unpaid booking cancelled successfully.",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

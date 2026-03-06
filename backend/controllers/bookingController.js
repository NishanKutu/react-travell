const Booking = require("../models/bookingModel");
const Destination = require("../models/destinationModel");
const crypto = require("crypto");
const CustomTour = require("../models/customTourModel");

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

exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and Amount are required",
      });
    }

    // Format configuration
    const secretKey = "8gBm/:&EnhH.1/q";
    const productCode = "EPAYTEST";
    const cleanAmount = String(Math.round(amount));
    const transactionUuid = `${bookingId}-${Date.now()}`;
    const message = `total_amount=${cleanAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

    // Return values to frontend
    res.status(200).json({
      success: true,
      signature,
      product_code: productCode,
      transaction_uuid: transactionUuid, // Send the unique one back
    });
  } catch (error) {
    console.error("Esewa Initiation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.redirect(`${process.env.FRONTEND_URL}/profile?payment=failed`);

    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );
    const { transaction_uuid, status } = decodedData;

    if (status === "COMPLETE") {
      const bookingId = transaction_uuid.split("-")[0];
      let order = await Booking.findById(bookingId) || await CustomTour.findById(bookingId);

      if (order) {
        order.status = "confirmed";
        order.paymentMethod = "esewa";
        await order.save();
        return res.redirect(
          `${process.env.FRONTEND_URL}/profile?payment=success`
        );
      }
    }
    res.redirect(`${process.env.FRONTEND_URL}/profile?payment=failed`);
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: error.message });
    // res.redirect(`${process.env.FRONTEND_URL}/profile?payment=failed`);
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

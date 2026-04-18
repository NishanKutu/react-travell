const Booking = require("../models/bookingModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Destination = require("../models/destinationModel");
const crypto = require("crypto");
const CustomTour = require("../models/customTourModel");
const User = require("../models/userModel");

const checkAvailability = async (staffId, role, start, end) => {
  const query = {
    status: { $in: ["pending", "confirmed"] },
    // Standard Overlap Logic: (NewStart <= ExistingEnd) AND (NewEnd >= ExistingStart)
    bookingDate: { $lte: end },
    endDate: { $gte: start },
  };

  if (role === "guide") query.guideId = staffId;
  if (role === "porter") query.porterId = staffId;

  const overlap = await Booking.findOne(query);
  return !overlap; // Returns true if no overlap is found
};

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
    // get destination to find duration
    const destination = await Destination.findById(destinationId);
    if (!destination)
      return res.status(404).json({ message: "Destination not found" });
    // parse duration and calculate dates
    const durationDays = parseInt(destination.duration) || 1;
    const startDate = new Date(bookingDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (durationDays - 1));
    // check guide availability
    if (hasGuide && guideId) {
      const available = await checkAvailability(
        guideId,
        "guide",
        startDate,
        endDate
      );
      if (!available)
        return res.status(400).json({
          success: false,
          message: "Guide is busy during these dates",
        });
    }
    // Check Porter Availability
    if (hasPorter && porterId) {
      const available = await checkAvailability(
        porterId,
        "porter",
        startDate,
        endDate
      );
      if (!available)
        return res.status(400).json({
          success: false,
          message: "Porter is busy during these dates",
        });
    }

    // Check if this user already has a booking for this destination on overlapping dates
    const userConflict = await Booking.findOne({
      userId: req.user._id,
      destinationId: destinationId,
      status: { $in: ["pending", "confirmed"] },
      bookingDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (userConflict) {
      return res.status(400).json({
        success: false,
        errorType: "BOOKING_CONFLICT",
        message: `You already have a booking for this destination from ${new Date(
          userConflict.bookingDate
        ).toLocaleDateString()} to ${new Date(
          userConflict.endDate
        ).toLocaleDateString()}. Please choose a different date.`,
      });
    }

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
      bookingDate: startDate,
      endDate: endDate,
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
      transaction_uuid: transactionUuid, // Sends the unique one back
    });
  } catch (error) {
    console.error("Esewa Initiation Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data)
      return res.redirect(`${process.env.FRONTEND_URL}/profile?payment=failed`);

    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );
    const { transaction_uuid, status } = decodedData;

    if (status === "COMPLETE") {
      const bookingId = transaction_uuid.split("-")[0];
      let order =
        (await Booking.findById(bookingId)) ||
        (await CustomTour.findById(bookingId));

      if (order) {
        order.status = "confirmed";
        order.paymentMethod = "esewa";
        await order.save();
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?payment=success`
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
      booking.refundAmount = refundAmount;

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

exports.initiateStripePayment = async (req, res) => {
  try {
    const { bookingId, amount, destinationName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "npr",
            product_data: {
              name: destinationName || "Trekking Booking",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?payment=success&session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
      cancel_url: `${process.env.FRONTEND_URL}/profile?payment=failed`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- STRIPE: Verify Payment ---
exports.verifyStripePayment = async (req, res) => {
  try {
    const { session_id, bookingId } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.status = "confirmed";
        booking.paymentMethod = "stripe";
        booking.transactionId = session.id; // Store Stripe Session ID
        await booking.save();
        return res
          .status(200)
          .json({ success: true, message: "Payment verified" });
      }
    }

    res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAvailableStaff = async (req, res) => {
  try {
    const { date, role, destinationId } = req.query;

    const destination = await Destination.findById(destinationId);
    if (!destination)
      return res.status(404).json({ message: "Destination not found" });

    const durationDays = parseInt(destination.duration) || 1;

    // --- NORMALIZE REQUESTED DATES ---
    // Force the start of the trek to the very beginning of the day (00:00:00)
    const requestedStart = new Date(date);
    requestedStart.setHours(0, 0, 0, 0);

    // Force the end of the trek to the very end of the final day (23:59:59)
    const requestedEnd = new Date(requestedStart);
    requestedEnd.setDate(requestedStart.getDate() + (durationDays - 1));
    requestedEnd.setHours(23, 59, 59, 999);

    // --- FIND OVERLAPS ---
    const activeBookings = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      // The overlapping logic:
      bookingDate: { $lte: requestedEnd },
      endDate: { $gte: requestedStart },
    });

    const occupiedStaffIds = [];
    activeBookings.forEach((b) => {
      if (role === "2" && b.guideId)
        occupiedStaffIds.push(b.guideId.toString());
      if (role === "3" && b.porterId)
        occupiedStaffIds.push(b.porterId.toString());
    });

    const availableStaff = await User.find({
      role: Number(role),
      _id: { $nin: occupiedStaffIds },
    }).select("-password");

    res.status(200).json({ success: true, data: availableStaff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

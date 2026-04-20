const mongoose = require("mongoose");
const Booking = require("../models/bookingModel");
const Message = require("../models/messageModel");

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "completed"];
const STAFF_ROLE_FIELD = {
  guide: "guideId",
  porter: "porterId",
};

const toId = (value) => value?._id?.toString?.() || value?.toString?.() || "";

const getConversationKey = (bookingId, staffRole) =>
  `${bookingId.toString()}:${staffRole}`;

const canUserAccessConversation = (booking, staffRole, userId) => {
  const travelerId = toId(booking.userId);
  const staffId = toId(booking[STAFF_ROLE_FIELD[staffRole]]);
  const currentUserId = userId.toString();

  return (
    Boolean(staffId) &&
    (currentUserId === travelerId || currentUserId === staffId)
  );
};

const buildConversation = (booking, staffRole, messageMeta = {}) => {
  const staffField = STAFF_ROLE_FIELD[staffRole];
  const staff = booking[staffField];

  return {
    bookingId: booking._id,
    staffRole,
    status: booking.status,
    destination: booking.destinationId,
    traveler: booking.userId,
    staff,
    lastMessage: messageMeta.lastMessage || null,
    unreadCount: messageMeta.unreadCount || 0,
    updatedAt:
      messageMeta.lastMessage?.createdAt ||
      booking.updatedAt ||
      booking.createdAt,
  };
};

const getAuthorizedConversation = async (bookingId, staffRole, userId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error("Invalid booking id");
    error.statusCode = 400;
    throw error;
  }

  if (!STAFF_ROLE_FIELD[staffRole]) {
    const error = new Error("Invalid staff role");
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findById(bookingId)
    .populate("userId", "username email image role")
    .populate("destinationId", "title location")
    .populate("guideId", "username email image role")
    .populate("porterId", "username email image role");

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
    const error = new Error("Chat is closed for this booking");
    error.statusCode = 403;
    throw error;
  }

  const staffField = STAFF_ROLE_FIELD[staffRole];
  const staff = booking[staffField];

  if (!staff) {
    const error = new Error(`No ${staffRole} is booked for this trek`);
    error.statusCode = 404;
    throw error;
  }

  const travelerId = toId(booking.userId);
  const staffId = toId(staff);
  const currentUserId = userId.toString();

  if (currentUserId !== travelerId && currentUserId !== staffId) {
    const error = new Error("You can only chat for your own booking");
    error.statusCode = 403;
    throw error;
  }

  return {
    booking,
    receiverId: currentUserId === travelerId ? staffId : travelerId,
  };
};

exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentRole = Number(req.user.role);
    const query = { status: { $in: ACTIVE_BOOKING_STATUSES } };

    if (currentRole === 2) {
      query.guideId = currentUserId;
    } else if (currentRole === 3) {
      query.porterId = currentUserId;
    } else {
      query.userId = currentUserId;
    }

    const bookings = await Booking.find(query)
      .populate("userId", "username email image role")
      .populate("destinationId", "title location")
      .populate("guideId", "username email image role")
      .populate("porterId", "username email image role")
      .sort({ updatedAt: -1 });

    const bookingIds = bookings.map((booking) => booking._id);

    const latestMessages =
      bookingIds.length > 0
        ? await Message.aggregate([
            { $match: { bookingId: { $in: bookingIds } } },
            { $sort: { createdAt: -1 } },
            {
              $group: {
                _id: { bookingId: "$bookingId", staffRole: "$staffRole" },
                lastMessage: { $first: "$$ROOT" },
              },
            },
          ])
        : [];

    const unreadCounts =
      bookingIds.length > 0
        ? await Message.aggregate([
            {
              $match: {
                bookingId: { $in: bookingIds },
                receiverId: currentUserId,
                readAt: null,
              },
            },
            {
              $group: {
                _id: { bookingId: "$bookingId", staffRole: "$staffRole" },
                count: { $sum: 1 },
              },
            },
          ])
        : [];

    const latestByConversation = latestMessages.reduce((map, item) => {
      map.set(getConversationKey(item._id.bookingId, item._id.staffRole), {
        ...item.lastMessage,
        _id: item.lastMessage._id.toString(),
      });
      return map;
    }, new Map());

    const unreadByConversation = unreadCounts.reduce((map, item) => {
      map.set(
        getConversationKey(item._id.bookingId, item._id.staffRole),
        item.count
      );
      return map;
    }, new Map());

    const conversations = [];

    bookings.forEach((booking) => {
      ["guide", "porter"].forEach((staffRole) => {
        const staffField = STAFF_ROLE_FIELD[staffRole];
        const staffMember = booking[staffField];

        if (!staffMember) return;
        if (!canUserAccessConversation(booking, staffRole, currentUserId))
          return;

        const key = getConversationKey(booking._id, staffRole);

        conversations.push(
          buildConversation(booking, staffRole, {
            lastMessage: latestByConversation.get(key),
            unreadCount: unreadByConversation.get(key) || 0,
          })
        );
      });
    });

    conversations.sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { bookingId, staffRole } = req.params;
    const { booking } = await getAuthorizedConversation(
      bookingId,
      staffRole,
      req.user._id
    );

    await Message.updateMany(
      {
        bookingId,
        staffRole,
        receiverId: req.user._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    const messages = await Message.find({ bookingId, staffRole })
      .populate("senderId", "username image role")
      .populate("receiverId", "username image role")
      .sort({ createdAt: 1 });

    const lastMessage =
      messages.length > 0 ? messages[messages.length - 1] : null;

    res.status(200).json({
      success: true,
      data: messages,
      conversation: buildConversation(booking, staffRole, {
        lastMessage,
        unreadCount: 0,
      }),
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, staffRole, text } = req.body;
    const cleanText = text?.trim();

    if (!cleanText) {
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });
    }

    const { receiverId } = await getAuthorizedConversation(
      bookingId,
      staffRole,
      req.user._id
    );

    const message = await Message.create({
      bookingId,
      staffRole,
      senderId: req.user._id,
      receiverId,
      text: cleanText,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "username image role")
      .populate("receiverId", "username image role");

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

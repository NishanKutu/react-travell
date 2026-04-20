const path = require("path");

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`
Usage:
  npm run seed
  npm run seed:reset
  npm run seed -- --remote

Options:
  --reset   Delete records owned by this seed before inserting them again.
  --remote  Use DATABASE from .env instead of forcing local MongoDB.
  --help    Show this message.
`);
  process.exit(0);
}

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const LOCAL_DATABASE_URL = "mongodb://127.0.0.1:27017/hikehub";

if (args.has("--remote")) {
  process.env.USE_REMOTE_DATABASE = "true";
} else {
  process.env.DATABASE = LOCAL_DATABASE_URL;
}

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const databaseConnection = require("../db/connection");
const Activity = require("../models/activityModel");
const Booking = require("../models/bookingModel");
const City = require("../models/cityModel");
const CustomTour = require("../models/customTourModel");
const Destination = require("../models/destinationModel");
const Faq = require("../models/faqModel");
const Message = require("../models/messageModel");
const Review = require("../models/reviewModel");
const Token = require("../models/tokenModel");
const User = require("../models/userModel");

const SEED_PASSWORD = process.env.SEED_PASSWORD || "Password123!";
const SALT_ROUNDS = 10;

const seedUsers = [
  {
    username: "Admin User",
    email: "admin@hikehub.com",
    role: 1,
    age: 34,
    bio: "Operations lead for HikeHub sample data.",
    specialization: "Operations",
    dailyRate: 0,
  },
  {
    username: "Maya Traveler",
    email: "maya.traveler@hikehub.com",
    role: 0,
    age: 29,
    bio: "Adventure traveler using the seeded customer account.",
    dailyRate: 0,
  },
  {
    username: "Tenzin Guide",
    email: "tenzin.guide@hikehub.com",
    role: 2,
    age: 41,
    experience: 12,
    dailyRate: 4500,
    bio: "Licensed trekking guide with high-altitude experience.",
    specialization: "Annapurna, Everest, cultural treks",
  },
  {
    username: "Bikash Porter",
    email: "bikash.porter@hikehub.com",
    role: 3,
    age: 27,
    experience: 6,
    dailyRate: 2500,
    bio: "Reliable porter for multi-day trekking routes.",
    specialization: "Mountain logistics",
    maxWeight: 25,
  },
];

const seedCities = ["Kathmandu", "Pokhara", "Chitwan", "Lumbini"];

const destinationImages = [
  "image-1771059040842-91277910.jpg",
  "image-1771059091464-844483349.jpg",
  "image-1771059222612-17005300.jpg",
  "image-1771059230509-577686108.jpg",
  "image-1771059375348-155937411.jpg",
  "images-1767372374764-198772144.webp",
  "images-1767372374765-333865629.jpg",
  "images-1767372374766-593000166.png",
];

const seedDestinations = [
  {
    title: "Annapurna Base Camp Trek",
    images: destinationImages.slice(0, 4),
    descriptions:
      "A classic Himalayan route through Gurung villages, rhododendron forest, and the glacier-ringed Annapurna sanctuary.",
    location: "Pokhara",
    price: 68000,
    duration: "9 Days",
    discount: 10,
    groupSize: 12,
    status: "active",
    availability: ["Autumn", "Spring"],
    isBestSeller: true,
    isNewTrip: false,
    isPromo: true,
    itinerary: [
      {
        day: 1,
        title: "Drive to Nayapul and trek to Tikhedhunga",
        descriptions:
          "Meet your guide in Pokhara, drive to the trailhead, and begin with a warm-up walk through terraced villages.",
      },
      {
        day: 2,
        title: "Climb to Ghorepani",
        descriptions:
          "Ascend stone steps through forested slopes with views toward Annapurna South.",
      },
      {
        day: 3,
        title: "Sunrise at Poon Hill",
        descriptions:
          "Catch sunrise over Dhaulagiri and Annapurna before continuing toward the sanctuary route.",
      },
    ],
    inclusions: {
      included: [
        "Airport transfers",
        "Licensed guide",
        "Trekking permits",
        "Tea house accommodation",
      ],
      notIncluded: ["International flights", "Travel insurance", "Personal gear"],
    },
  },
  {
    title: "Everest View Trek",
    images: destinationImages.slice(2, 6),
    descriptions:
      "A shorter Everest region journey that reaches Namche Bazaar and rewards travelers with clear views of Everest, Ama Dablam, and Thamserku.",
    location: "Kathmandu",
    price: 82000,
    duration: "7 Days",
    discount: 0,
    groupSize: 10,
    status: "active",
    availability: ["Autumn", "Spring", "Winter"],
    isBestSeller: true,
    isNewTrip: false,
    isPromo: false,
    itinerary: [
      {
        day: 1,
        title: "Fly to Lukla and trek to Phakding",
        descriptions:
          "Take a scenic mountain flight and follow the Dudh Koshi valley to Phakding.",
      },
      {
        day: 2,
        title: "Trek to Namche Bazaar",
        descriptions:
          "Cross suspension bridges and climb into the Sherpa capital of Namche.",
      },
      {
        day: 3,
        title: "Everest panorama day",
        descriptions:
          "Explore viewpoints above Namche and visit local monasteries and museums.",
      },
    ],
    inclusions: {
      included: [
        "Domestic flight support",
        "Licensed guide",
        "Sagarmatha National Park permit",
        "Breakfast during trek",
      ],
      notIncluded: ["Lunch and dinner", "Emergency evacuation", "Tips"],
    },
  },
  {
    title: "Chitwan Wildlife Escape",
    images: destinationImages.slice(4, 8),
    descriptions:
      "A lowland jungle escape with canoeing, village walks, and wildlife viewing in Chitwan National Park.",
    location: "Chitwan",
    price: 28000,
    duration: "3 Days",
    discount: 5,
    groupSize: 16,
    status: "active",
    availability: ["Autumn", "Winter", "Spring"],
    isBestSeller: false,
    isNewTrip: true,
    isPromo: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive in Sauraha",
        descriptions:
          "Check in, meet your naturalist, and take an evening village walk.",
      },
      {
        day: 2,
        title: "Safari and canoe ride",
        descriptions:
          "Explore river habitats by canoe and join a guided jungle safari.",
      },
      {
        day: 3,
        title: "Birdwatching and departure",
        descriptions:
          "Start early with birdwatching before returning to Kathmandu or Pokhara.",
      },
    ],
    inclusions: {
      included: ["Hotel stay", "Park activities", "Naturalist guide", "Meals"],
      notIncluded: ["Personal expenses", "Bar bills", "Optional upgrades"],
    },
  },
];

const seedFaqs = [
  {
    question: "Do I need travel insurance?",
    answer:
      "Yes. We recommend insurance that covers trekking, evacuation, medical treatment, and trip interruption.",
    category: "Safety",
    section: "Before you book",
    order: 1,
  },
  {
    question: "Can I hire a guide or porter during booking?",
    answer:
      "Yes. The booking flow lets you add available guides and porters for your selected travel dates.",
    category: "Booking",
    section: "Before you book",
    order: 2,
  },
  {
    question: "What should I pack for trekking?",
    answer:
      "Bring layered clothing, broken-in boots, rain protection, a daypack, reusable water bottle, and personal medication.",
    category: "Preparation",
    section: "Before your trip",
    order: 1,
  },
  {
    question: "How do staff messages work?",
    answer:
      "After booking, travelers can message assigned guides or porters from the profile area.",
    category: "Support",
    section: "During your trip",
    order: 1,
  },
];

const activitiesByCity = {
  Kathmandu: [
    {
      name: "Kathmandu Durbar Square Walk",
      cost: 1800,
      description: "A guided walk through courtyards, temples, and old market lanes.",
      category: "Culture",
      preferredTime: ["Morning", "Afternoon"],
    },
    {
      name: "Boudhanath Evening Visit",
      cost: 1200,
      description: "Join the evening kora around one of Nepal's largest stupas.",
      category: "Culture",
      preferredTime: ["Evening"],
    },
  ],
  Pokhara: [
    {
      name: "Sarangkot Sunrise",
      cost: 2500,
      description: "Early morning ridge viewpoint with Annapurna and Machhapuchhre views.",
      category: "Nature",
      preferredTime: ["Morning"],
    },
    {
      name: "Phewa Lake Paddle",
      cost: 1500,
      description: "A relaxed paddle on Phewa Lake with mountain reflections on clear days.",
      category: "Leisure",
      preferredTime: ["Afternoon", "Evening"],
    },
  ],
  Chitwan: [
    {
      name: "Rapti River Canoe",
      cost: 2200,
      description: "A quiet canoe ride along the Rapti River wetlands.",
      category: "Wildlife",
      preferredTime: ["Morning"],
    },
    {
      name: "Tharu Cultural Program",
      cost: 1000,
      description: "An evening performance introducing Tharu music and dance.",
      category: "Culture",
      preferredTime: ["Evening"],
    },
  ],
  Lumbini: [
    {
      name: "Sacred Garden Visit",
      cost: 900,
      description: "A calm visit to the Maya Devi Temple and surrounding monastic zone.",
      category: "Heritage",
      preferredTime: ["Morning", "Afternoon"],
    },
  ],
};

const seedBookingTransactionIds = ["seed-booking-annapurna-001"];
const seedUserEmails = seedUsers.map((user) => user.email);
const seedDestinationTitles = seedDestinations.map((destination) => destination.title);
const seedFaqQuestions = seedFaqs.map((faq) => faq.question);
const seedActivityNames = Object.values(activitiesByCity)
  .flat()
  .map((activity) => activity.name);

const upsertOne = async (Model, filter, data) => {
  return Model.findOneAndUpdate(
    filter,
    { $set: data },
    {
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    }
  );
};

const upsertUser = async (user, passwordHash) => {
  return upsertOne(
    User,
    { email: user.email },
    {
      ...user,
      email: user.email.toLowerCase(),
      password: passwordHash,
      image: user.image || "",
      isVerified: true,
      isAvailable: true,
    }
  );
};

const resetSeedData = async () => {
  const users = await User.find({ email: { $in: seedUserEmails } }).select("_id");
  const destinations = await Destination.find({
    title: { $in: seedDestinationTitles },
  }).select("_id");
  const cities = await City.find({ cityname: { $in: seedCities } }).select(
    "_id cityname"
  );
  const bookings = await Booking.find({
    transactionId: { $in: seedBookingTransactionIds },
  }).select("_id");

  const userIds = users.map((user) => user._id);
  const destinationIds = destinations.map((destination) => destination._id);
  const cityIds = cities.map((city) => city._id);
  const bookingIds = bookings.map((booking) => booking._id);

  await Message.deleteMany({ bookingId: { $in: bookingIds } });
  const kathmandu = cities.find((city) => city.cityname === "Kathmandu");
  if (kathmandu) {
    await CustomTour.deleteMany({
      userId: { $in: userIds },
      "itinerary.0.destinationCity": kathmandu._id,
      travelerCount: 2,
      totalPrice: 13400,
    });
  }
  await Review.deleteMany({
    user: { $in: userIds },
    destination: { $in: destinationIds },
  });
  await Booking.deleteMany({ transactionId: { $in: seedBookingTransactionIds } });
  await Activity.deleteMany({
    name: { $in: seedActivityNames },
    places: { $in: cityIds },
  });
  await Faq.deleteMany({ question: { $in: seedFaqQuestions } });
  await Token.deleteMany({ user: { $in: userIds } });
  await Destination.deleteMany({ title: { $in: seedDestinationTitles } });
  await City.deleteMany({ cityname: { $in: seedCities } });
  await User.deleteMany({ email: { $in: seedUserEmails } });
};

const seedDatabase = async () => {
  await databaseConnection;

  if (args.has("--reset")) {
    console.log("Resetting seed-owned records...");
    await resetSeedData();
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  const users = {};
  for (const user of seedUsers) {
    users[user.email] = await upsertUser(user, passwordHash);
  }

  const cities = {};
  for (const cityname of seedCities) {
    cities[cityname] = await upsertOne(City, { cityname }, { cityname });
  }

  const destinations = {};
  for (const destination of seedDestinations) {
    destinations[destination.title] = await upsertOne(
      Destination,
      { title: destination.title },
      destination
    );
  }

  for (const faq of seedFaqs) {
    await upsertOne(Faq, { question: faq.question }, faq);
  }

  const activities = {};
  for (const [cityname, activityList] of Object.entries(activitiesByCity)) {
    for (const activity of activityList) {
      const savedActivity = await upsertOne(
        Activity,
        { name: activity.name, places: cities[cityname]._id },
        { ...activity, places: cities[cityname]._id }
      );
      activities[activity.name] = savedActivity;
    }
  }

  const customer = users["maya.traveler@hikehub.com"];
  const guide = users["tenzin.guide@hikehub.com"];
  const porter = users["bikash.porter@hikehub.com"];
  const annapurna = destinations["Annapurna Base Camp Trek"];
  const everest = destinations["Everest View Trek"];
  const chitwan = destinations["Chitwan Wildlife Escape"];

  const bookingStart = new Date("2026-10-12T00:00:00.000Z");
  const bookingEnd = new Date("2026-10-20T00:00:00.000Z");
  const booking = await upsertOne(
    Booking,
    { transactionId: seedBookingTransactionIds[0] },
    {
      userId: customer._id,
      destinationId: annapurna._id,
      travelerCount: 2,
      bookingDate: bookingStart,
      endDate: bookingEnd,
      hasGuide: true,
      hasPorter: true,
      guideId: guide._id,
      guideCost: guide.dailyRate,
      porterId: porter._id,
      porterCost: porter.dailyRate,
      totalPrice: 136000 + guide.dailyRate * 9 + porter.dailyRate * 9,
      status: "confirmed",
      paymentMethod: "stripe",
      transactionId: seedBookingTransactionIds[0],
    }
  );

  await upsertOne(
    Review,
    { user: customer._id, destination: annapurna._id },
    {
      user: customer._id,
      destination: annapurna._id,
      guide: guide._id,
      rating: 5,
      comment:
        "The route was organized beautifully, and the guide made the altitude days feel manageable.",
      images: destinationImages.slice(0, 2),
    }
  );

  await upsertOne(
    Review,
    { user: customer._id, destination: everest._id },
    {
      user: customer._id,
      destination: everest._id,
      guide: guide._id,
      rating: 4,
      comment:
        "Namche was the highlight. Great pacing for travelers who want mountain views without a longer expedition.",
      images: destinationImages.slice(2, 4),
    }
  );

  const customTourItinerary = [
    {
      dayNumber: 1,
      destinationCity: cities.Kathmandu._id,
      bookingDate: new Date("2026-11-05T00:00:00.000Z"),
      morning: [activities["Kathmandu Durbar Square Walk"]._id],
      afternoon: [],
      evening: [activities["Boudhanath Evening Visit"]._id],
    },
    {
      dayNumber: 2,
      destinationCity: cities.Pokhara._id,
      bookingDate: new Date("2026-11-06T00:00:00.000Z"),
      morning: [activities["Sarangkot Sunrise"]._id],
      afternoon: [activities["Phewa Lake Paddle"]._id],
      evening: [],
    },
  ];

  await upsertOne(
    CustomTour,
    {
      userId: customer._id,
      "itinerary.0.destinationCity": cities.Kathmandu._id,
      travelerCount: 2,
    },
    {
      userId: customer._id,
      itinerary: customTourItinerary,
      totalPrice: 13400,
      status: "pending",
      travelerCount: 2,
      guideId: guide._id,
      guideCost: guide.dailyRate,
    }
  );

  await upsertOne(
    Message,
    {
      bookingId: booking._id,
      staffRole: "guide",
      senderId: customer._id,
      receiverId: guide._id,
      text: "Hi Tenzin, should we bring microspikes for the October departure?",
    },
    {
      bookingId: booking._id,
      staffRole: "guide",
      senderId: customer._id,
      receiverId: guide._id,
      text: "Hi Tenzin, should we bring microspikes for the October departure?",
      readAt: null,
    }
  );

  await upsertOne(
    Message,
    {
      bookingId: booking._id,
      staffRole: "porter",
      senderId: porter._id,
      receiverId: customer._id,
      text: "I will meet you at the Pokhara hotel lobby before departure.",
    },
    {
      bookingId: booking._id,
      staffRole: "porter",
      senderId: porter._id,
      receiverId: customer._id,
      text: "I will meet you at the Pokhara hotel lobby before departure.",
      readAt: null,
    }
  );

  console.log("Seed completed successfully.");
  console.log(`Users: ${seedUsers.length}`);
  console.log(`Cities: ${seedCities.length}`);
  console.log(`Destinations: ${seedDestinations.length}`);
  console.log(`Activities: ${seedActivityNames.length}`);
  console.log(`FAQs: ${seedFaqs.length}`);
  console.log("Bookings: 1");
  console.log("Custom tours: 1");
  console.log("Reviews: 2");
  console.log("Messages: 2");
  console.log("");
  console.log("Seed login accounts:");
  console.log(`  Admin:    admin@hikehub.com / ${SEED_PASSWORD}`);
  console.log(`  Customer: maya.traveler@hikehub.com / ${SEED_PASSWORD}`);
  console.log(`  Guide:    tenzin.guide@hikehub.com / ${SEED_PASSWORD}`);
  console.log(`  Porter:   bikash.porter@hikehub.com / ${SEED_PASSWORD}`);
  console.log("");
  console.log(
    "Run `npm run seed:reset` to remove and recreate only these seed-owned records."
  );
};

seedDatabase()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

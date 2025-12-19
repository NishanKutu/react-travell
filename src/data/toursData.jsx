import yangtzeImg from '../assets/img/Yangtze.webp';
import bridgeImg from '../assets/img/bridge.jpg';
import pandaImg from '../assets/img/panda.png';
import indiaImg from '../assets/img/India.webp';
import templeImg from '../assets/img/temple.jpg';
import deerImg from '../assets/img/deer.webp';
import desert from '../assets/img/Desert.jpg';

export const tours = [
    {
        id: 1,
        code: 'RAJ',
        title: 'Best Of Japan',
        gallery: [
            indiaImg, // Main large photo (Step 1)
            templeImg, // Smaller photo (Step 2)
            desert, // Smaller photo (Step 3)
            templeImg  // Smaller photo (Step 4)
        ],
        fullDescription: "Experience the perfect blend of ancient tradition and futuristic technology...",
        duration: '9 Days 7 Nights',
        cities: 'Tokyo · Kyoto · Nara · Osaka',
        price: 2949,
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80',
        itinerary: [
            { day: 1, title: "USA - Tokyo: Fly to Japan", desc: "Your adventure begins as you depart for the Land of the Rising Sun." },
            { day: 2, title: "Arrive Tokyo", desc: "Transfer to your hotel and enjoy a welcome dinner in Shinjuku." },
            { day: 3, title: "Tokyo City Tour", desc: "Explore Meiji Shrine and the bustling streets of Shibuya." }
        ],
        promo: 'SAVE $250 ON 2026 DATES',
        bestSeller: true,
    
    },
    {
        id: 2,
        code: 'RDY',
        title: 'Yangtze Essence',
        gallery: [
            indiaImg, // Main large photo (Step 1)
            templeImg, // Smaller photo (Step 2)
            desert, // Smaller photo (Step 3)
            templeImg  // Smaller photo (Step 4)
        ],
        fullDescription: "Experience the perfect blend of ancient tradition and futuristic technology...",
        duration: '13 Days 11 Nights',
        cities: 'Beijing · Xian · Chongqing · Yangtze River · Yichang · Shanghai',
        price: 3250,
        promo: 'SAVE $350 ON 2026 DATES',
        image: yangtzeImg,
        itinerary: [
            { day: 1, title: "USA - Tokyo: Fly to Japan", desc: "Your adventure begins as you depart for the Land of the Rising Sun." },
            { day: 2, title: "Arrive Tokyo", desc: "Transfer to your hotel and enjoy a welcome dinner in Shinjuku." },
            { day: 3, title: "Tokyo City Tour", desc: "Explore Meiji Shrine and the bustling streets of Shibuya." }
        ],
        bestSeller: true,
    },
    {
        id: 3,
        code: 'CDN',
        title: 'Gems of Europe',
        gallery: [
            indiaImg, // Main large photo (Step 1)
            templeImg, // Smaller photo (Step 2)
            desert, // Smaller photo (Step 3)
            templeImg  // Smaller photo (Step 4)
        ],
        fullDescription: "Experience the perfect blend of ancient tradition and futuristic technology...",
        duration: '12 Days 10 Nights',
        cities: 'London · Paris · Lucrene · Milan · Venice · Montecatini',
        price: 2900,
        promo: 'SAVE $550 ON 2026 DATES',
        image: bridgeImg,
        itinerary: [
            { day: 1, title: "USA - Tokyo: Fly to Japan", desc: "Your adventure begins as you depart for the Land of the Rising Sun." },
            { day: 2, title: "Arrive Tokyo", desc: "Transfer to your hotel and enjoy a welcome dinner in Shinjuku." },
            { day: 3, title: "Tokyo City Tour", desc: "Explore Meiji Shrine and the bustling streets of Shibuya." }
        ],
        bestSeller: true,
    },
    {
        id: 4,
        code: 'EBC',
        title: 'Classic China',
        gallery: [
            indiaImg, // Main large photo (Step 1)
            templeImg, // Smaller photo (Step 2)
            desert, // Smaller photo (Step 3)
            templeImg  // Smaller photo (Step 4)
        ],
        fullDescription: "Experience the perfect blend of ancient tradition and futuristic technology...",
        duration: '12 Days 11 Nights',
        cities: 'Beijing · Xian · Chengdu · Shanghai',
        price: 3050,
        promo: 'SAVE $350 ON 2026 DATES',
        image: pandaImg,
        itinerary: [
            { day: 1, title: "USA - Tokyo: Fly to Japan", desc: "Your adventure begins as you depart for the Land of the Rising Sun." },
            { day: 2, title: "Arrive Tokyo", desc: "Transfer to your hotel and enjoy a welcome dinner in Shinjuku." },
            { day: 3, title: "Tokyo City Tour", desc: "Explore Meiji Shrine and the bustling streets of Shibuya." }
        ],
        bestSeller: true,
    },
    {
        id: 5,
        code: 'DRD',
        title: 'Majestic India & Scenic Sri Lanka',
        gallery: [
            indiaImg, // Main large photo (Step 1)
            templeImg, // Smaller photo (Step 2)
            desert, // Smaller photo (Step 3)
            templeImg  // Smaller photo (Step 4)
        ],
        fullDescription: "Experience the perfect blend of ancient tradition and futuristic technology...",
        duration: '15 Days 14 Nights',
        cities: 'Delhi · Varanasi · Delhi · Agra · Jaipur · Mumbai · Colombo · Negombo · Dambulla · Kanady · Nuwara eliya · Colombo',
        price: 8500,
        image: templeImg,
        itinerary: [
            { day: 1, title: "USA - Tokyo: Fly to Japan", desc: "Your adventure begins as you depart for the Land of the Rising Sun." },
            { day: 2, title: "Arrive Tokyo", desc: "Transfer to your hotel and enjoy a welcome dinner in Shinjuku." },
            { day: 3, title: "Tokyo City Tour", desc: "Explore Meiji Shrine and the bustling streets of Shibuya." }
        ],
        bestSeller: true,
    },
    {
        id: 6,
        code: 'CNB',
        title: 'Magical Kenya Safari',
        gallery: [
            indiaImg, // Main large photo (Step 1)
            templeImg, // Smaller photo (Step 2)
            desert, // Smaller photo (Step 3)
            templeImg  // Smaller photo (Step 4)
        ],
        fullDescription: "Experience the perfect blend of ancient tradition and futuristic technology...",
        duration: '9 Days 8 Nights',
        cities: 'Nairobi · Aberdare National Park · Shaba National Reserve · Lake Nakuru National Park · Masai Mara National Reserve · Nairobi',
        price: 3700,
        promo: 'SAVE $200 ON 2026 DATES',
        image: deerImg,
        itinerary: [
            { day: 1, title: "USA - Tokyo: Fly to Japan", desc: "Your adventure begins as you depart for the Land of the Rising Sun." },
            { day: 2, title: "Arrive Tokyo", desc: "Transfer to your hotel and enjoy a welcome dinner in Shinjuku." },
            { day: 3, title: "Tokyo City Tour", desc: "Explore Meiji Shrine and the bustling streets of Shibuya." }
        ],
        newTrip: true,
    },
    {
        id: 7,
        code: 'CBZ',
        title: 'Egypt & Jordan',
        gallery: [
            indiaImg, // Main large photo (Step 1)
            templeImg, // Smaller photo (Step 2)
            desert, // Smaller photo (Step 3)
            templeImg  // Smaller photo (Step 4)
        ],
        fullDescription: "Experience the perfect blend of ancient tradition and futuristic technology...",
        duration: '15 Days 14 Nights',
        cities: 'Cairo · Luxor · Nile Cruise · Esna · Edfu · Kom ombo · Aswan · Cairo · Amman · Jerash · Petra · Wadi rum · Amman',
        price: 4550,
        promo: 'SAVE $300 ON 2026 DATES',
        image: desert,
        itinerary: [
            { day: 1, title: "USA - Tokyo: Fly to Japan", desc: "Your adventure begins as you depart for the Land of the Rising Sun." },
            { day: 2, title: "Arrive Tokyo", desc: "Transfer to your hotel and enjoy a welcome dinner in Shinjuku." },
            { day: 3, title: "Tokyo City Tour", desc: "Explore Meiji Shrine and the bustling streets of Shibuya." }
        ],
        newTrip: true,
    },
    {
        id: 8,
        code: 'RCB',
        title: 'India',
        gallery: [
            indiaImg, // Main large photo (Step 1)
            templeImg, // Smaller photo (Step 2)
            desert, // Smaller photo (Step 3)
            templeImg  // Smaller photo (Step 4)
        ],
        fullDescription: "Experience the perfect blend of ancient tradition and futuristic technology...",
        duration: '8 Days 7 Nights',
        cities: 'Delhi · Mumbai · Jaipur · Agra · Goa · Rishikesh',
        price: 4500,
        promo: 'SAVE $150 ON 2026 DATES',
        image: indiaImg,
        itinerary: [
            { day: 1, title: "USA - Tokyo: Fly to Japan", desc: "Your adventure begins as you depart for the Land of the Rising Sun." },
            { day: 2, title: "Arrive Tokyo", desc: "Transfer to your hotel and enjoy a welcome dinner in Shinjuku." },
            { day: 3, title: "Tokyo City Tour", desc: "Explore Meiji Shrine and the bustling streets of Shibuya." }
        ],
        bestSeller: true,
    },
    
];
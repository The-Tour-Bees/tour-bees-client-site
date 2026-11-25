// Fills the database with demo content so the website looks complete: events, trips, hotels,
// houseboats and two demo hosts. Everything it adds is flagged demo: true.
//
//   node --env-file=.env.local scripts/seed-demo.mjs            add or refresh the demo content
//   node --env-file=.env.local scripts/seed-demo.mjs --remove   delete all demo content
//
// Pictures are real stock photos from Unsplash (see PHOTOS below). Names are made up. Replace with real content before launch.
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Hotel from "../models/Hotel.js";
import Houseboat from "../models/Houseboat.js";
import Trip from "../models/Trip.js";
import User from "../models/User.js";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/seed-demo.mjs");
  process.exit(1);
}

// Real stock photos (Unsplash), one per category name used below. Verified live 2026-11-25.
const PHOTOS = {
  beach: "photo-1507525428034-b723cf961d3e",
  island: "photo-1514282401047-d79a71a590e8",
  resort: "photo-1571896349842-33c89424de2d",
  room: "photo-1611892440504-42a792e24d32",
  hills: "photo-1470071459604-3b5ec3a7fe05",
  mountain: "photo-1506905925346-21bda4d32df4",
  tea: "photo-1591089101324-2280d9260000",
  forest: "photo-1441974231531-c6227db76b6e",
  river: "photo-1504893524553-b855bce32c67",
  boat: "photo-1476514525535-07fb3b4ae5f1",
  houseboat: "photo-1602216056096-3b40cc0c9944",
  heritage: "photo-1524492412937-b28074a5d7da",
  food: "photo-1504674900247-0877df9cc836",
  city: "photo-1449824913935-59a10b8d2000",
  bangkok: "photo-1508009603885-50cf7c579365",
  temple: "photo-1596402184320-417e7178b2cd",
  dunes: "photo-1509316785289-025f5b846b35",
  dubai: "photo-1512453979798-5ea266f8880c",
  waterfall: "photo-1432405972618-c60b0225b8f9",
};
const img = (...names) =>
  names.map((n) => {
    const id = PHOTOS[n];
    if (!id) throw new Error("Unknown demo photo category: " + n);
    return "https://images.unsplash.com/" + id + "?q=80&w=1600&auto=format&fit=crop";
  });
const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
const day = (offset) => {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

await mongoose.connect(process.env.MONGODB_URI);

if (process.argv.includes("--remove")) {
  const results = await Promise.all([Event, Trip, Hotel, Houseboat, User].map((M) => M.deleteMany({ demo: true })));
  console.log("Removed demo content:", results.map((r, i) => `${["events", "trips", "hotels", "houseboats", "users"][i]} ${r.deletedCount}`).join(", "));
  await mongoose.disconnect();
  process.exit(0);
}

// Replaces a demo item with the same slug. A real item with that slug is never touched.
async function put(Model, doc) {
  const existing = await Model.findOne({ slug: doc.slug });
  if (existing && !existing.demo) {
    console.warn(`Skipped ${doc.slug}: a real item already uses it`);
    return;
  }
  await Model.replaceOne({ slug: doc.slug }, { ...doc, demo: true, published: true }, { upsert: true });
}

// ---------- Demo hosts (they cannot sign in: nobody knows their passwords) ----------
const hostData = [
  { username: "demo-tanvir", fullName: "Tanvir Hasan", email: "demo-tanvir@example.com", mobile: "+8801000000001" },
  { username: "demo-nusrat", fullName: "Nusrat Jahan", email: "demo-nusrat@example.com", mobile: "+8801000000002" },
];
const hosts = [];
for (const h of hostData) {
  let u = await User.findOne({ username: h.username });
  if (!u) {
    u = await User.create({
      ...h,
      accountType: "host",
      passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString("base64"), 10),
      mustChangePassword: true,
      status: "active",
      approvalStatus: "approved",
      demo: true,
    });
  }
  hosts.push(u);
}
const [tanvir, nusrat] = hosts;

// ---------- Events ----------
const events = [
  {
    slug: "sundarbans-mangrove-weekend", title: "Sundarbans Mangrove Weekend", host: tanvir,
    summary: "Two nights on the water, deep in the world's largest mangrove forest.",
    description: "Cruise through narrow creeks, watch for deer and kingfishers from the deck, and walk the forest edge with a local guide. A slow, quiet weekend for people who love the outdoors.",
    location: "Khulna", place: "Khulna", startsOn: day(-75), endsOn: day(-73), basePriceBdt: 18500, seats: 24, seatsLeft: 0,
    images: img("forest", "river", "boat"), tags: ["nature", "boat", "wildlife"],
    inclusions: ["Boat stay for two nights", "All meals", "Forest guide", "Entry permits"],
    itinerary: [{ title: "Day 1", text: "Meet in Khulna and board the boat. Evening cruise." }, { title: "Day 2", text: "Creek walks, birdwatching and a sunset on the deck." }, { title: "Day 3", text: "Morning cruise back and farewell breakfast." }],
  },
  {
    slug: "srimangal-tea-trail", title: "Srimangal Tea Trail", host: nusrat,
    summary: "Walk the tea gardens, taste seven-layer tea and stay among the hills.",
    description: "A relaxed weekend in Bangladesh's tea capital. Visit a working tea estate, hike through a rainforest reserve and end each day with a cup in the garden.",
    location: "Srimangal, Sylhet", place: "Sylhet", startsOn: day(-40), endsOn: day(-38), basePriceBdt: 12500, seats: 20, seatsLeft: 0,
    images: img("tea", "hills"), tags: ["tea", "nature", "walking"],
    inclusions: ["Two nights in a garden lodge", "Breakfast and dinner", "Estate visit", "Local transport"],
    itinerary: [{ title: "Day 1", text: "Arrive, check in and an evening tea tasting." }, { title: "Day 2", text: "Estate tour and a rainforest hike." }, { title: "Day 3", text: "Sunrise walk and departure." }],
  },
  {
    slug: "saint-martin-island-escape", title: "Saint Martin Island Escape", host: tanvir,
    summary: "Coral beaches, clear water and long evenings on Bangladesh's only coral island.",
    description: "Take the ship across the bay and spend three days on the island: swimming, kayaking, beach walks and seafood dinners under the stars.",
    location: "Saint Martin's Island", place: "Cox's Bazar", startsOn: day(-1), endsOn: day(2), basePriceBdt: 22000, seats: 20, seatsLeft: 4,
    images: img("island", "beach", "resort"), tags: ["beach", "island", "swimming"],
    inclusions: ["Ship tickets", "Two nights in a beach resort", "All meals", "Guided island walk"],
    itinerary: [{ title: "Day 1", text: "Ship crossing and beach check-in." }, { title: "Day 2", text: "Snorkelling, kayaking and a bonfire dinner." }, { title: "Day 3", text: "Sunrise walk and return crossing." }],
  },
  {
    slug: "old-dhaka-heritage-walk", title: "Old Dhaka Heritage Walk and Night Food Tour", host: nusrat,
    summary: "A day of old mansions, river ghats and the best street food in the city.",
    description: "Wander the lanes of Old Dhaka with a local historian, ride a boat on the Buriganga at dusk and finish with a long street-food dinner.",
    location: "Old Dhaka", place: "Dhaka", startsOn: day(9), endsOn: day(9), basePriceBdt: 3500, seats: 25, seatsLeft: 11,
    images: img("heritage", "food"), tags: ["city", "food", "history"],
    inclusions: ["Guide", "River boat ride", "Food tastings", "Rickshaw rides"],
    itinerary: [{ title: "Morning", text: "Heritage mansions and old markets." }, { title: "Afternoon", text: "Ghats and a boat ride." }, { title: "Evening", text: "Street food dinner crawl." }],
  },
  {
    slug: "bandarban-cloud-trek", title: "Bandarban Cloud Trek", host: tanvir,
    summary: "Above the clouds in the Chittagong Hill Tracts, with village stays and big views.",
    description: "Three days of walking between hill villages, with sunrise above the clouds, a waterfall swim and homestay dinners cooked by local families.",
    location: "Bandarban", place: "Bandarban", startsOn: day(12), endsOn: day(15), basePriceBdt: 16500, seats: 16, seatsLeft: 7,
    images: img("hills", "mountain", "tea"), tags: ["trekking", "hills", "village"],
    inclusions: ["Homestays", "All meals on the trek", "Local guides", "Jeep transfers"],
    itinerary: [{ title: "Day 1", text: "Jeep ride into the hills and a first village stay." }, { title: "Day 2", text: "Ridge walk, waterfall swim and sunset viewpoint." }, { title: "Day 3", text: "Sunrise above the clouds, then return." }],
  },
  {
    slug: "haor-houseboat-weekend", title: "Haor Houseboat Weekend", host: nusrat,
    summary: "Drift across the vast wetlands on a houseboat, with fishing villages and birds at dawn.",
    description: "Stay on a houseboat across the haor, visit fishing villages, eat what the boatmen catch and watch the water turn gold at sunset.",
    location: "Sunamganj", place: "Sunamganj", startsOn: day(22), endsOn: day(24), basePriceBdt: 14500, seats: 30, seatsLeft: 12,
    images: img("houseboat", "river"), tags: ["houseboat", "wetlands", "birds"],
    inclusions: ["Houseboat stay", "All meals", "Village visit", "Boat guide"],
    itinerary: [{ title: "Day 1", text: "Board in Sunamganj and set off across the haor." }, { title: "Day 2", text: "Village visit, fishing and a sunset on the water." }, { title: "Day 3", text: "Dawn birdwatching and return." }],
  },
  {
    slug: "cox-bazar-sunset-retreat", title: "Cox's Bazar Sunset Retreat", host: tanvir,
    summary: "Four relaxed days on the world's longest natural sea beach.",
    description: "Slow mornings, long beach walks, seafood dinners and a sunset every evening. Plenty of free time, with optional excursions to Inani and Himchari.",
    location: "Cox's Bazar", place: "Cox's Bazar", startsOn: day(36), endsOn: day(39), basePriceBdt: 19500, seats: 28, seatsLeft: 28,
    images: img("beach", "resort", "island"), tags: ["beach", "relax", "sunset"],
    inclusions: ["Three nights in a beach resort", "Breakfast", "Airport or bus transfers", "Excursion to Inani"],
    itinerary: [{ title: "Day 1", text: "Arrival and a first sunset on the beach." }, { title: "Day 2", text: "Free day, or the Inani and Himchari excursion." }, { title: "Day 3", text: "Beach morning and a seafood dinner." }],
  },
  {
    slug: "sylhet-tea-and-waterfall-days", title: "Sylhet Tea and Waterfall Days", host: nusrat,
    summary: "Green hills, tea estates and cool waterfalls across the Sylhet region.",
    description: "Cross the tea estates by jeep, swim at a waterfall, take a boat across the Ratargul swamp forest and rest in a garden lodge.",
    location: "Sylhet", place: "Sylhet", startsOn: day(58), endsOn: day(60), basePriceBdt: 15500, seats: 24, seatsLeft: 24,
    images: img("tea", "hills", "forest"), tags: ["tea", "waterfalls", "nature"],
    inclusions: ["Two nights in a garden lodge", "Meals", "Jeep and boat transfers", "Guide"],
    itinerary: [{ title: "Day 1", text: "Tea estates and a sunset viewpoint." }, { title: "Day 2", text: "Waterfall swim and the Ratargul swamp forest." }, { title: "Day 3", text: "Morning market visit and departure." }],
  },
];
for (const { host, ...e } of events) await put(Event, { ...e, hostId: host._id, tags: e.tags });

// ---------- Trips ----------
const trips = [
  { slug: "coxs-bazar-beach-break", scope: "domestic", title: "Cox's Bazar Beach Break", destination: "Cox's Bazar", durationDays: 4, basePriceBdt: 21000, images: img("beach", "resort", "island"), tags: ["beach", "relax"],
    summary: "Sun, sand and sea, planned around you.", description: "Four days on the longest sea beach, with a comfortable resort, seafood dinners and optional excursions. We arrange transport, rooms and any extras you want.",
    inclusions: ["Three nights in a beach resort", "Daily breakfast", "Airport or bus transfers", "One guided excursion"], exclusions: ["Flights or bus tickets", "Lunch and dinner", "Personal expenses"],
    itinerary: [{ title: "Day 1", text: "Arrive and settle in. Evening beach walk." }, { title: "Day 2", text: "Free day or the Inani and Himchari excursion." }, { title: "Day 3", text: "Beach and water activities." }, { title: "Day 4", text: "Breakfast and departure." }] },
  { slug: "sundarbans-mangrove-adventure", scope: "domestic", title: "Sundarbans Mangrove Adventure", destination: "Khulna", durationDays: 3, basePriceBdt: 18000, images: img("forest", "river", "boat"), tags: ["nature", "wildlife", "boat"],
    summary: "A boat journey into the mangrove forest.", description: "Sleep on a boat, cruise quiet creeks and walk the forest edge with a guide. Best from November to February.",
    inclusions: ["Two nights on a boat", "All meals", "Forest permits", "Guide"], exclusions: ["Transport to Khulna", "Drinks", "Tips"],
    itinerary: [{ title: "Day 1", text: "Board in Mongla and cruise into the forest." }, { title: "Day 2", text: "Creek walks, birdwatching and a watchtower visit." }, { title: "Day 3", text: "Morning cruise and return." }] },
  { slug: "bandarban-hills-escape", scope: "domestic", title: "Bandarban Hills Escape", destination: "Bandarban", durationDays: 4, basePriceBdt: 19500, images: img("hills", "mountain"), tags: ["hills", "trekking", "village"],
    summary: "Waterfalls, viewpoints and village stays in the hills.", description: "Four days among the hills of Bandarban: jeep rides, short treks, a waterfall and homestay dinners.",
    inclusions: ["Hotel and homestay nights", "Meals on the trek", "Local guide", "Jeep transfers"], exclusions: ["Transport to Bandarban", "Personal gear"],
    itinerary: [{ title: "Day 1", text: "Arrive and visit a golden temple." }, { title: "Day 2", text: "Jeep to the viewpoint and a waterfall swim." }, { title: "Day 3", text: "Village trek and homestay dinner." }, { title: "Day 4", text: "Sunrise and return." }] },
  { slug: "srimangal-tea-country", scope: "domestic", title: "Srimangal Tea Country", destination: "Sylhet", durationDays: 2, basePriceBdt: 11000, images: img("tea", "hills"), tags: ["tea", "nature", "short break"],
    summary: "A quick escape to the tea gardens.", description: "A short break among green tea estates, with a rainforest walk and a famous seven-layer tea.",
    inclusions: ["One night in a garden lodge", "Meals", "Estate visit"], exclusions: ["Transport to Srimangal"],
    itinerary: [{ title: "Day 1", text: "Estate tour, tea tasting and a rainforest walk." }, { title: "Day 2", text: "Sunrise in the garden and departure." }] },
  { slug: "sylhet-waterfalls-and-tea", scope: "domestic", title: "Sylhet Waterfalls and Tea", destination: "Sylhet", durationDays: 3, basePriceBdt: 14000, images: img("waterfall", "tea", "hills"), tags: ["waterfalls", "tea"],
    summary: "Swim at waterfalls and sip tea in the hills.", description: "Three days across Sylhet: Jaflong, Ratargul swamp forest, Lalakhal's blue water and the tea estates.",
    inclusions: ["Two nights in a hotel", "Breakfast", "Boat and jeep transfers"], exclusions: ["Lunch and dinner", "Transport to Sylhet"],
    itinerary: [{ title: "Day 1", text: "Tea estates and a sunset viewpoint." }, { title: "Day 2", text: "Ratargul swamp forest and Lalakhal." }, { title: "Day 3", text: "Jaflong and the border hills." }] },
  { slug: "saint-martin-island-getaway", scope: "domestic", title: "Saint Martin Island Getaway", destination: "Cox's Bazar", durationDays: 3, basePriceBdt: 17500, images: img("island", "beach"), tags: ["island", "beach", "snorkelling"],
    summary: "Clear water, coral beaches and quiet nights.", description: "A ship across the bay, two nights on the island and plenty of time on the sand and in the water.",
    inclusions: ["Ship tickets", "Two nights in a beach resort", "Meals"], exclusions: ["Transport to Teknaf", "Water sports"],
    itinerary: [{ title: "Day 1", text: "Ship crossing and beach check-in." }, { title: "Day 2", text: "Snorkelling, kayaking and a beach dinner." }, { title: "Day 3", text: "Sunrise walk and return." }] },

  { slug: "bangkok-and-pattaya-highlights", scope: "international", title: "Bangkok and Pattaya Highlights", destination: "Thailand", durationDays: 6, basePriceBdt: 85000, images: img("bangkok", "temple", "island"), tags: ["city", "temples", "beach"],
    summary: "Temples, markets and beaches in one trip.", description: "Six days between Bangkok's temples, floating markets and Pattaya's beaches, with hotels and transfers arranged for you.",
    inclusions: ["Five nights in 4-star hotels", "Daily breakfast", "Airport and city transfers", "City tour with guide"], exclusions: ["International flights", "Visa fees", "Lunch and dinner"],
    itinerary: [{ title: "Day 1", text: "Arrive in Bangkok and check in." }, { title: "Day 2", text: "Grand Palace, Wat Pho and a river cruise." }, { title: "Day 3", text: "Floating market and street food evening." }, { title: "Day 4", text: "Transfer to Pattaya and beach time." }, { title: "Day 5", text: "Island boat trip." }, { title: "Day 6", text: "Return to Bangkok and fly home." }] },
  { slug: "kathmandu-and-pokhara", scope: "international", title: "Kathmandu and Pokhara", destination: "Nepal", durationDays: 6, basePriceBdt: 72000, images: img("mountain", "temple", "river"), tags: ["mountains", "culture", "lakes"],
    summary: "Ancient squares and mountain views.", description: "Explore the temples of Kathmandu, then fly to Pokhara for lake views and a sunrise over the Himalayas.",
    inclusions: ["Five nights in hotels", "Breakfast", "Domestic flight", "Sightseeing with guide"], exclusions: ["International flights", "Entry fees", "Meals not mentioned"],
    itinerary: [{ title: "Day 1", text: "Arrive in Kathmandu." }, { title: "Day 2", text: "Pashupatinath, Boudhanath and Durbar Square." }, { title: "Day 3", text: "Fly to Pokhara. Evening by the lake." }, { title: "Day 4", text: "Sunrise at Sarangkot and Phewa Lake boat ride." }, { title: "Day 5", text: "Free day or an easy hike." }, { title: "Day 6", text: "Return and depart." }] },
  { slug: "bhutan-monastery-trail", scope: "international", title: "Bhutan Monastery Trail", destination: "Bhutan", durationDays: 6, basePriceBdt: 140000, images: img("temple", "mountain"), tags: ["monasteries", "mountains", "culture"],
    summary: "Cliffside monasteries and quiet valleys.", description: "Visit Thimphu, Punakha and the famous Tiger's Nest monastery with a private guide and driver.",
    inclusions: ["Five nights in hotels", "All meals", "Private guide and driver", "Sustainable development fee"], exclusions: ["International flights", "Tips"],
    itinerary: [{ title: "Day 1", text: "Fly into Paro." }, { title: "Day 2", text: "Thimphu city and its monasteries." }, { title: "Day 3", text: "Dochula Pass to Punakha." }, { title: "Day 4", text: "Punakha Dzong and a village walk." }, { title: "Day 5", text: "Hike to Tiger's Nest." }, { title: "Day 6", text: "Departure." }] },
  { slug: "maldives-island-escape", scope: "international", title: "Maldives Island Escape", destination: "Maldives", durationDays: 5, basePriceBdt: 165000, images: img("island", "resort", "beach"), tags: ["island", "beach", "snorkelling"],
    summary: "Turquoise water and overwater rooms.", description: "Five days on a quiet island resort with snorkelling, sunset cruises and time to do nothing at all.",
    inclusions: ["Four nights at an island resort", "Breakfast and dinner", "Speedboat transfers"], exclusions: ["International flights", "Excursions"],
    itinerary: [{ title: "Day 1", text: "Arrive and transfer to the island." }, { title: "Day 2", text: "Snorkelling and lagoon time." }, { title: "Day 3", text: "Sunset cruise." }, { title: "Day 4", text: "Free day." }, { title: "Day 5", text: "Departure." }] },
  { slug: "dubai-city-and-desert", scope: "international", title: "Dubai City and Desert", destination: "UAE", durationDays: 5, basePriceBdt: 125000, images: img("dubai", "dunes", "resort"), tags: ["city", "desert", "shopping"],
    summary: "Skyscrapers by day, dunes by sunset.", description: "Five days of city sights, a desert safari with dinner, the old souks and a dhow cruise.",
    inclusions: ["Four nights in a 4-star hotel", "Breakfast", "Desert safari with dinner", "Airport transfers"], exclusions: ["International flights", "Visa fees", "Observation deck tickets"],
    itinerary: [{ title: "Day 1", text: "Arrive and settle in." }, { title: "Day 2", text: "City tour and the old souks." }, { title: "Day 3", text: "Desert safari and dinner." }, { title: "Day 4", text: "Dhow cruise and free evening." }, { title: "Day 5", text: "Departure." }] },
  { slug: "kuala-lumpur-and-langkawi", scope: "international", title: "Kuala Lumpur and Langkawi", destination: "Malaysia", durationDays: 6, basePriceBdt: 98000, images: img("city", "resort", "island"), tags: ["city", "beach", "family"],
    summary: "A big city and a beach island, side by side.", description: "Two days in Kuala Lumpur, then fly to Langkawi for beaches, mangrove tours and the cable car.",
    inclusions: ["Five nights in hotels", "Breakfast", "Domestic flight", "Langkawi island tour"], exclusions: ["International flights", "Meals not mentioned"],
    itinerary: [{ title: "Day 1", text: "Arrive in Kuala Lumpur." }, { title: "Day 2", text: "Petronas Towers and Batu Caves." }, { title: "Day 3", text: "Fly to Langkawi." }, { title: "Day 4", text: "Island tour and mangrove boat." }, { title: "Day 5", text: "Cable car and beach time." }, { title: "Day 6", text: "Departure." }] },
];
for (const [i, t] of trips.entries()) await put(Trip, { ...t, sortOrder: i });

// ---------- Hotels and resorts ----------
const hotels = [
  { slug: "lagoon-breeze-resort", name: "Lagoon Breeze Resort", type: "resort", place: "Cox's Bazar", stars: 4, basePriceBdt: 9500, images: img("resort", "beach", "island"), tags: ["beach", "pool", "family"],
    summary: "A beachfront resort with a big pool and sea-view rooms.", description: "Steps from the sand, with a large pool, a seafood restaurant and rooms that face the sea. Easy for families and groups.", amenities: ["Sea-view rooms", "Pool", "Restaurant", "Wi-Fi", "Airport transfer"] },
  { slug: "coral-bay-beach-resort", name: "Coral Bay Beach Resort", type: "resort", place: "Saint Martin's Island", stars: 4, basePriceBdt: 11000, images: img("island", "beach"), tags: ["island", "beach", "quiet"],
    summary: "Cottages on a quiet stretch of coral beach.", description: "Simple, comfortable cottages a few steps from clear water, with fresh seafood and no traffic in sight.", amenities: ["Beach cottages", "Restaurant", "Kayaks", "Generator backup"] },
  { slug: "tea-valley-retreat", name: "Tea Valley Retreat", type: "resort", place: "Sylhet", stars: 3, basePriceBdt: 5800, images: img("tea", "hills"), tags: ["tea", "nature", "quiet"],
    summary: "A garden lodge among the tea estates.", description: "Green views from every room, morning walks through the estate and tea served on the veranda.", amenities: ["Garden views", "Restaurant", "Guided estate walk", "Free parking"] },
  { slug: "hill-crest-retreat", name: "Hill Crest Retreat", type: "resort", place: "Bandarban", stars: 4, basePriceBdt: 8200, images: img("hills", "mountain"), tags: ["hills", "views"],
    summary: "Hilltop rooms above the clouds.", description: "A hilltop resort with wide views, a sunrise terrace and easy access to the main viewpoints and waterfalls.", amenities: ["Hill views", "Sunrise terrace", "Restaurant", "Jeep booking"] },
  { slug: "riverside-heritage-hotel", name: "Riverside Heritage Hotel", type: "hotel", place: "Dhaka", stars: 4, basePriceBdt: 7600, images: img("heritage", "river"), tags: ["city", "heritage", "river"],
    summary: "A restored old building by the river in the old city.", description: "Arched corridors, high ceilings and a rooftop looking over the river. Close to the old markets and ghats.", amenities: ["Rooftop", "Restaurant", "Wi-Fi", "Air conditioning"] },
  { slug: "city-light-hotel-dhaka", name: "City Light Hotel", type: "hotel", place: "Dhaka", stars: 3, basePriceBdt: 4500, images: img("room", "city"), tags: ["city", "business"],
    summary: "A clean, central hotel for short city stays.", description: "Simple rooms, quick Wi-Fi and a good breakfast, a short ride from the airport and the main business areas.", amenities: ["Wi-Fi", "Breakfast", "Air conditioning", "Airport pickup"] },
  { slug: "sylhet-garden-inn", name: "Sylhet Garden Inn", type: "hotel", place: "Sylhet", stars: 3, basePriceBdt: 4200, images: img("tea", "forest"), tags: ["city", "garden"],
    summary: "A calm garden hotel close to the main sights.", description: "A comfortable base for day trips to the tea estates, waterfalls and swamp forest.", amenities: ["Garden", "Wi-Fi", "Breakfast", "Car hire"] },
  { slug: "mangrove-gate-lodge", name: "Mangrove Gate Lodge", type: "hotel", place: "Khulna", stars: 3, basePriceBdt: 3800, images: img("forest", "boat"), tags: ["nature", "gateway"],
    summary: "A simple lodge at the gateway to the Sundarbans.", description: "Rest before or after your boat trip into the forest. Early breakfast and help with permits and boat bookings.", amenities: ["Early breakfast", "Wi-Fi", "Boat booking help", "Parking"] },
];
for (const [i, h] of hotels.entries()) await put(Hotel, { ...h, sortOrder: i });

// ---------- Houseboats ----------
const houseboats = [
  { slug: "haor-dreamer", name: "Haor Dreamer", place: "Sunamganj", cabins: 4, capacity: 10, dayTrip: true, basePriceBdt: 32000, images: img("houseboat", "river"), tags: ["wetlands", "sunset"],
    summary: "A wooden houseboat for the open wetlands.", description: "Four cabins, a roof deck and a crew who cook on board. Drift across the haor, stop at fishing villages and watch the sun go down over the water.", amenities: ["Four cabins", "Roof deck", "All meals", "Crew and cook", "Life jackets"] },
  { slug: "padma-drifter", name: "Padma Drifter", place: "Munshiganj", cabins: 3, capacity: 8, dayTrip: true, basePriceBdt: 26000, images: img("houseboat", "boat"), tags: ["river", "weekend"],
    summary: "A river houseboat close to Dhaka.", description: "Three cabins and a shaded deck, an easy weekend escape on the Padma. Good for small groups and family gatherings.", amenities: ["Three cabins", "Shaded deck", "Meals on board", "Music system"] },
  { slug: "sundarbans-explorer", name: "Sundarbans Explorer", place: "Khulna", cabins: 6, capacity: 14, dayTrip: false, basePriceBdt: 45000, images: img("houseboat", "forest", "river"), tags: ["forest", "wildlife"],
    summary: "A comfortable boat built for the mangrove forest.", description: "Six cabins, a viewing deck and a guide on board. Moves slowly through the creeks so you can watch for wildlife from the water.", amenities: ["Six cabins", "Viewing deck", "Forest guide", "All meals", "Safety equipment"] },
  { slug: "kaptai-lake-cruiser", name: "Kaptai Lake Cruiser", place: "Rangamati", cabins: 3, capacity: 8, dayTrip: true, basePriceBdt: 24000, images: img("boat", "hills"), tags: ["lake", "hills"],
    summary: "A lake cruiser among the hills of Rangamati.", description: "Cruise the calm lake between forested hills, stop at island villages and sleep on the water.", amenities: ["Three cabins", "Open deck", "Meals on board", "Village stop"] },
];
for (const [i, b] of houseboats.entries()) await put(Houseboat, { ...b, sortOrder: i });

console.log(`Demo content ready: ${events.length} events, ${trips.length} trips, ${hotels.length} hotels, ${houseboats.length} houseboats, ${hosts.length} demo hosts.`);
await mongoose.disconnect();

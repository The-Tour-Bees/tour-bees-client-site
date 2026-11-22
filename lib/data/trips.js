// Ready-made trip packages shown on the Customized Trip pages. Prices are BDT per person.
// TODO: move to the `trips` collection once the database is connected (master_plan.md section 9).
//
// {
//   slug: "cox-bazar-getaway",
//   scope: "domestic",            // "domestic" | "international"
//   title: "Cox's Bazar Getaway",
//   summary: "One line shown on the card.",
//   description: "Longer text for the package page.",
//   destination: "Cox's Bazar",   // used by the destination filter (city or country)
//   durationDays: 4,
//   basePriceBdt: 18000,
//   images: ["/trips/coxs-bazar.jpg"],
//   tags: ["beach"],
//   inclusions: ["Hotel", "Breakfast"],
//   exclusions: ["Flights"],
//   itinerary: [{ title: "Day 1", text: "..." }],
// }
export const TRIPS = [];

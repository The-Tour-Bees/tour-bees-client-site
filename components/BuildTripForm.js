import EnquiryForm from "./EnquiryForm";

const HOTEL_LEVELS = ["No preference", "Budget", "Standard", "Comfort", "Luxury"];
const TRANSPORT = ["Not sure yet", "Please include transport", "I will arrange my own"];

// scope: "domestic" | "international". When omitted the visitor chooses.
export default function BuildTripForm({ scope }) {
  const fields = [
    { name: "name", label: "Full name", required: true, autoComplete: "name" },
    { name: "mobile", label: "Mobile / WhatsApp", type: "tel", required: true, autoComplete: "tel", placeholder: "+8801XXXXXXXXX" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    ...(scope ? [] : [{ name: "scope", label: "Trip type", type: "select", options: ["Domestic", "International"] }]),
    { name: "destination", label: "Where do you want to go?", required: true, placeholder: "City, region or country" },
    { name: "startDate", label: "From", type: "date" },
    { name: "endDate", label: "To", type: "date" },
    { name: "travellers", label: "Travellers", type: "number", required: true, placeholder: "2" },
    { name: "budget", label: "Budget per person (optional)", type: "number", placeholder: "e.g. 25000" },
    { name: "budgetCurrency", label: "Budget currency", type: "select", options: ["BDT", "USD", "EUR", "INR"] },
    { name: "hotelLevel", label: "Hotel level", type: "select", options: HOTEL_LEVELS },
    { name: "transport", label: "Transport", type: "select", options: TRANSPORT },
    { name: "interests", label: "What do you enjoy?", placeholder: "Beaches, hiking, food, history…", full: true },
    { name: "message", label: "Anything else we should know", type: "textarea", full: true },
  ];

  return (
    <EnquiryForm
      type="custom_trip"
      hidden={scope ? { scope: scope === "domestic" ? "Domestic" : "International" } : undefined}
      fields={fields}
      submitLabel="Build my trip"
      successTitle="Trip request received"
      successText="Thank you. Our team will contact you with a plan and a price soon."
    />
  );
}

import EnquiryForm from "./EnquiryForm";

const person = [
  { name: "name", label: "Full name", required: true, autoComplete: "name" },
  { name: "mobile", label: "Mobile / WhatsApp", type: "tel", required: true, autoComplete: "tel", placeholder: "+8801XXXXXXXXX" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
];

// item: the chosen hotel/houseboat. Without one, the visitor says where they want to stay.
export default function StayEnquiryForm({ kind, item, defaults }) {
  const isHotel = kind === "hotels";

  const fields = isHotel
    ? [
        ...person,
        ...(item ? [] : [{ name: "place", label: "Where do you want to stay?", required: true, placeholder: "City or area" }]),
        { name: "checkIn", label: "Check-in", type: "date", required: true },
        { name: "checkOut", label: "Check-out", type: "date", required: true },
        { name: "adults", label: "Adults", type: "number", required: true, placeholder: "2" },
        { name: "children", label: "Children", type: "number", placeholder: "0" },
        { name: "rooms", label: "Rooms", type: "number", required: true, placeholder: "1" },
        { name: "message", label: "Message (optional)", type: "textarea", full: true },
      ]
    : [
        ...person,
        ...(item ? [] : [{ name: "place", label: "Where do you want to go?", required: true, placeholder: "Area or river" }]),
        { name: "stayType", label: "Type", type: "select", options: ["Overnight", "Day trip"] },
        { name: "checkIn", label: "Date / check-in", type: "date", required: true },
        { name: "checkOut", label: "Check-out (overnight)", type: "date" },
        { name: "guests", label: "Guests", type: "number", required: true, placeholder: "4" },
        { name: "cabins", label: "Cabins", type: "number", placeholder: "1" },
        { name: "message", label: "Message (optional)", type: "textarea", full: true },
      ];

  const hidden = item
    ? isHotel
      ? { hotelSlug: item.slug, hotelName: item.name, place: item.place }
      : { houseboatSlug: item.slug, houseboatName: item.name, place: item.place }
    : undefined;

  return (
    <EnquiryForm
      type={isHotel ? "hotel" : "houseboat"}
      hidden={hidden}
      defaults={defaults}
      fields={fields}
      submitLabel="Send booking enquiry"
      successTitle="Enquiry received"
      successText="Thank you. Our team will check availability and contact you soon. This is an enquiry, not a confirmed booking."
      note="No payment is taken online. We confirm availability and price with you directly."
    />
  );
}

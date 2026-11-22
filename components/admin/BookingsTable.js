import { dateOf, money } from "../../lib/format";
import BookingStatusSelect from "./BookingStatusSelect";
import StatusPill from "./StatusPill";

// bookings: plain objects. Columns adapt to who is looking.
export default function BookingsTable({ bookings, role, commissionByBooking = {} }) {
  if (bookings.length === 0) return <p className="empty">No bookings yet.</p>;
  const showCommission = role === "agent";
  const showStatusControl = role === "admin";

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Booked</th>
            <th scope="col">Ref</th>
            <th scope="col">{role === "member" ? "Booking" : "Guest"}</th>
            {role !== "member" && <th scope="col">Booking</th>}
            <th scope="col">Guests</th>
            <th scope="col">Amount</th>
            {showCommission && <th scope="col">Commission</th>}
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{dateOf(b.createdAt)}</td>
              <td>{b.ref}</td>
              <td className="table__strong">{role === "member" ? b.title : b.guestName}</td>
              {role !== "member" && <td>{b.title}</td>}
              <td>{b.travellers}</td>
              <td>{money(b.amountBdt)}</td>
              {showCommission && <td>{commissionByBooking[b.id] != null ? money(commissionByBooking[b.id]) : "–"}</td>}
              <td>{showStatusControl ? <BookingStatusSelect id={b.id} status={b.status} /> : <StatusPill status={b.status} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

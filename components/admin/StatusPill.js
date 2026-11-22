import { cap } from "../../lib/format";

export default function StatusPill({ status }) {
  return <span className={`pill pill--${status}`}>{cap(status)}</span>;
}

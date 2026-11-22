// Sets the last word(s) of a heading in the serif accent (see the design system's HeroHeading).
export default function AccentTitle({ text, words = 1 }) {
  const parts = String(text).split(" ");
  if (parts.length <= words) return <span className="serif">{text}</span>;
  const head = parts.slice(0, -words).join(" ");
  const tail = parts.slice(-words).join(" ");
  return (
    <>
      {head} <span className="serif">{tail}</span>
    </>
  );
}

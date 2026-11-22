import AccentTitle from "../AccentTitle";

export default function AdminTitle({ role, title, children }) {
  return (
    <div className="admin-head">
      <div>
        {role && <p className="admin-head__role">{role}</p>}
        <h1><AccentTitle text={title} /></h1>
      </div>
      {children}
    </div>
  );
}

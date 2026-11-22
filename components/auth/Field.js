// A labelled input with its error message, for the sign-in and admin forms.
export default function Field({ id, label, error, required, full, children, hint }) {
  return (
    <div className={full ? "form__field form__field--full" : "form__field"}>
      <label className="form__label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <span className="form__hint">{hint}</span>}
      {error && <span id={`${id}-error`} className="form__error">{error}</span>}
    </div>
  );
}

export const inputProps = (id, error) => ({
  id,
  name: id,
  className: "form__input",
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});

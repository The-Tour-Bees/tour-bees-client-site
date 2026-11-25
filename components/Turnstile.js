"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      loading = undefined; // let the next form try again
      script.remove();
      reject(new Error("Turnstile did not load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

function Widget({ theme }) {
  const box = useRef(null);

  useEffect(() => {
    let id;
    let gone = false;
    loadTurnstile()
      .then((turnstile) => {
        if (gone) return;
        const el = box.current;
        // The flexible widget needs 300px; narrower panels get the compact one.
        id = turnstile.render(el, { sitekey: SITE_KEY, theme, size: el.clientWidth < 300 ? "compact" : "flexible" });
      })
      .catch((err) => console.error(err.message));
    return () => {
      gone = true;
      if (id !== undefined) window.turnstile.remove(id);
    };
  }, [theme]);

  return <div ref={box} className="form__field form__field--full" />;
}

// Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. The widget adds its token to the
// surrounding form as "cf-turnstile-response". Tokens work once, so change `attempt` after each
// failed submit to get a fresh widget.
export default function Turnstile({ attempt = 0, theme = "dark" }) {
  if (!SITE_KEY) return null;
  return <Widget key={attempt} theme={theme} />;
}

// Builds public/og.jpg, the 1200x630 image shown when a link to the site is shared.
//
//   node scripts/og/make-og.mjs
//
// Uses sharp (installed with Next.js), public/hero-bg.png, public/logo.png and the fonts in ./fonts
// (Geist and Instrument Serif, SIL Open Font License). Linux only: fonts are loaded through fontconfig.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const pub = (file) => path.join(root, "public", file);

// Point fontconfig at the bundled fonts before sharp (and so the SVG renderer) loads.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tb-og-"));
const conf = path.join(tmp, "fonts.conf");
fs.writeFileSync(conf, `<?xml version="1.0"?><fontconfig><dir>${path.join(here, "fonts")}</dir><cachedir>${tmp}</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE = conf;
const { default: sharp } = await import("sharp");

const W = 1200;
const H = 630;
const AMBER = "#f5a623";
const DARK = "#1c1c1e";

// Artwork, scaled to the full height and cropped so the mountain and tent stay on the right.
const art = await sharp(pub("hero-bg.png")).resize({ height: H }).toBuffer({ resolveWithObject: true });
const background = await sharp(art.data)
  .extract({ left: Math.max(0, art.info.width - W - 40), top: 0, width: W, height: H })
  .toBuffer();

const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${DARK}" stop-opacity="0.98"/>
      <stop offset="0.52" stop-color="${DARK}" stop-opacity="0.93"/>
      <stop offset="0.70" stop-color="${DARK}" stop-opacity="0.45"/>
      <stop offset="0.86" stop-color="${DARK}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${AMBER}"/>
  <rect x="72" y="64" width="112" height="136" rx="24" fill="#fff8ee"/>
  <text x="68" y="338" font-family="Geist" font-weight="700" font-size="88" letter-spacing="-3" fill="#ffffff">The Tour Bees</text>
  <text x="72" y="436" font-family="Instrument Serif" font-style="italic" font-size="86" fill="${AMBER}">Tour For Life</text>
  <rect x="72" y="494" width="340" height="62" rx="31" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.22"/>
  <circle cx="108" cy="525" r="7" fill="${AMBER}"/>
  <text x="130" y="535" font-family="Geist" font-weight="500" font-size="30" fill="#ffffff">thetourbees.com</text>
</svg>`);

const logo = await sharp(pub("logo.png")).resize({ height: 116 }).toBuffer({ resolveWithObject: true });

await sharp(background)
  .composite([
    { input: overlay },
    { input: logo.data, left: 72 + Math.round((112 - logo.info.width) / 2), top: 74 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(pub("og.jpg"));

fs.rmSync(tmp, { recursive: true, force: true });
console.log("Wrote public/og.jpg");

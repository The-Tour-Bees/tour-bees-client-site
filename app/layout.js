import "./globals.css";
import { CurrencyProvider } from "../components/CurrencyProvider";
import Footer from "../components/Footer";
import FooterGate from "../components/FooterGate";
import { SITE } from "../lib/site";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
};

export const viewport = { themeColor: "#1c1c1e" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body>
        <CurrencyProvider>
          {children}
          <FooterGate>
            <Footer />
          </FooterGate>
        </CurrencyProvider>
      </body>
    </html>
  );
}

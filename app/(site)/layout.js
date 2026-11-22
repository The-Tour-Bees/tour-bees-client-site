import SiteHeader from "../../components/SiteHeader";

// Inner pages get the solid header. The home page renders its own overlay header inside the hero.
export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main className="main">{children}</main>
    </>
  );
}

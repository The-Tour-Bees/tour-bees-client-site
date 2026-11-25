import Hero from "./Hero";
import RecommendationStrip from "../components/RecommendationStrip";
import { recommend } from "../lib/services/recommendations";

export const metadata = {
  title: { absolute: "The Tour Bees — Tour For Life" },
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await recommend({ limit: 6, perKind: 3 }).catch(() => []);
  return (
    <>
      <main id="main">
        <Hero />
      <RecommendationStrip
        items={items}
        title="Picked for you"
        description="Coming up soon and ready to book."
        alt
      />
      </main>
    </>
  );
}

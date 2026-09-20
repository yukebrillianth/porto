import { Education, FunFact, Hero, Social } from '@/components/home';
import { Footer, Navbar } from '@/components/layouts';

/**
 * Home. Metadata is inherited from the root layout's defaults.
 *
 * Band order is load-bearing — the page reads as a dark-chrome / light-paper
 * rhythm: Hero(dark) → FunFact(light) → Education(dark) → Social(dark).
 */
export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <FunFact />

        {/*
        INTEGRATION SLOT — the Portfolio and LatestPosts sections are injected
        here by the integration pass. Both read from services/ (Hygraph and
        Hashnode); this file must not import from services/ directly.

        <Portfolio />
        <LatestPosts />
      */}

        <Education />
        <Social />
      </main>

      <Footer />
    </>
  );
}

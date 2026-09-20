import {
  Education,
  FunFact,
  Hero,
  LatestPosts,
  PortfolioPreview,
  Social,
} from '@/components/home';
import { Footer, Navbar } from '@/components/layouts';
import { Section } from '@/components/ui';
import { getPosts } from '@/services/posts';
import { getProjects } from '@/services/projects';

/** ISR - matches REVALIDATE_SECONDS. Next requires a static literal here. */
export const revalidate = 3600;

/**
 * Home. Metadata is inherited from the root layout's defaults.
 *
 * Band order is load-bearing - the page reads as a dark-chrome / light-paper
 * rhythm: Hero(dark) → FunFact(light) → Education + Social + Portfolio(dark)
 * → LatestPosts(light) → Footer(dark).
 */
export default async function Home() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts(3)]);

  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <FunFact />

        {/*
          Education, Social and Portfolio share one dark band, as they did in
          2022. The hairline grid's background-size steps from 400% to cover
          across breakpoints, so giving each its own background would restart
          and rescale the grid at every seam. One wrapper keeps it continuous
          and lets the orbs bleed between the three.
        */}
        <Section className="grid-bg-dark bg-dark text-white">
          <Education />
          <Social />
          <PortfolioPreview projects={projects.slice(0, 8)} />
        </Section>

        <LatestPosts posts={posts} />
      </main>

      <Footer />
    </>
  );
}

import {
  Education,
  FunFact,
  Hero,
  LatestPosts,
  PortfolioPreview,
  Social,
} from '@/components/home';
import { Footer, Navbar } from '@/components/layouts';
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
        <Education />
        <Social />
        <PortfolioPreview projects={projects.slice(0, 8)} />
        <LatestPosts posts={posts} />
      </main>

      <Footer />
    </>
  );
}

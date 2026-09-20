import type { Metadata } from 'next';

import { siteConfig } from '@/constants';
import { generateMetadata as buildMetadata } from '@/lib/seo';

import ContactContainer from './container';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description:
    'Get in touch about robotics, distributed systems, AI or product engineering work.',
  url: `${siteConfig.url}/contact`,
});

export default function ContactPage() {
  return <ContactContainer />;
}

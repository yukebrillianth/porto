import { Metadata } from 'next';

import { gilroy, ptSerif } from '@/app/fonts';
import { defaultMetadata } from '@/lib/seo';
import { ToastProvider } from '@/providers/ToastProvider';

import './globals.css';

export const metadata: Metadata = defaultMetadata;

/**
 * Navbar/Footer are deliberately NOT rendered here.
 *
 * The navbar has no background of its own - it inherits the grid + orb of
 * whatever section it sits on. `/portfolio` renders it inside its own dark
 * hero section, so a root-level navbar would either double up or force an
 * overlay hack (fixed positioning + per-page top padding) that the 2022
 * design never had. Each page composes `<Navbar />` and `<Footer />` from
 * `@/components/layouts` instead, matching the original.
 *
 * There are no context providers: this is a portfolio + blog with no auth and
 * no user state, and all data fetching is server-side ISR. `ToastProvider` is
 * a leaf sibling, not a wrapper - the contact form is its only consumer.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables go on <html>, not <body>. Tailwind emits the theme
    // tokens into :root, so --font-gilroy has to be in scope there for
    // --font-sans to resolve to anything but the system-ui fallback.
    <html lang="en" className={`${gilroy.variable} ${ptSerif.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}

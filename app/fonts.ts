import { PT_Serif } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * Gilroy — the brand face, self-hosted.
 *
 * The 2022 stylesheet registered both Bold and ExtraBold as `font-weight: bold`,
 * which made ExtraBold unreachable. Weights are declared numerically here so the
 * whole family is actually usable.
 */
export const gilroy = localFont({
  src: [
    { path: './fonts/Gilroy-Thin.woff2', weight: '100', style: 'normal' },
    { path: './fonts/Gilroy-ThinItalic.woff2', weight: '100', style: 'italic' },
    { path: './fonts/Gilroy-UltraLight.woff2', weight: '200', style: 'normal' },
    {
      path: './fonts/Gilroy-UltraLightItalic.woff2',
      weight: '200',
      style: 'italic',
    },
    { path: './fonts/Gilroy-Light.woff2', weight: '300', style: 'normal' },
    {
      path: './fonts/Gilroy-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    { path: './fonts/Gilroy-Regular.woff2', weight: '400', style: 'normal' },
    {
      path: './fonts/Gilroy-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    { path: './fonts/Gilroy-Medium.woff2', weight: '500', style: 'normal' },
    {
      path: './fonts/Gilroy-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    { path: './fonts/Gilroy-SemiBold.woff2', weight: '600', style: 'normal' },
    {
      path: './fonts/Gilroy-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
    { path: './fonts/Gilroy-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/Gilroy-BoldItalic.woff2', weight: '700', style: 'italic' },
    { path: './fonts/Gilroy-ExtraBold.woff2', weight: '800', style: 'normal' },
    {
      path: './fonts/Gilroy-ExtraBoldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    { path: './fonts/Gilroy-Black.woff2', weight: '900', style: 'normal' },
    {
      path: './fonts/Gilroy-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-gilroy',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * PT Serif — long-form reading body only (blog posts, project detail prose).
 *
 * The 2022 site declared this in CSS but never loaded it, so it silently fell back
 * to a generic serif. Now it is actually loaded.
 */
export const ptSerif = PT_Serif({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-pt-serif',
  display: 'swap',
});

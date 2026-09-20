export const siteConfig = {
  name: 'Yuke Brilliant Hestiavin',
  shortName: 'yukebrillianth',
  title: 'Yuke Brilliant — Software Engineer, Robotics & Full Stack',
  description:
    'Software Engineer building across full-stack applications, distributed systems, and autonomous robotics. Undergraduate Computer Engineering at ITS Surabaya.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://yukebrillianth.my.id',
  ogImage: '/og-image.jpg',
  creator: 'Yuke Brilliant Hestiavin',
  locale: 'en_US',
  location: 'Surabaya / Sidoarjo, East Java, Indonesia',
  role: 'Software Engineer | Autonomous Robotics | Full Stack Developer',
  hashnodeHost: 'yukebrillianth.hashnode.dev',
  keywords: [
    'Yuke Brilliant Hestiavin',
    'yukebrillianth',
    'Software Engineer',
    'Autonomous Robotics',
    'Full Stack Developer',
    'ROS',
    'Distributed Systems',
    'Next.js',
    'ITS Surabaya',
  ],
} as const;

export const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/portfolio', label: 'PORTFOLIO' },
  { href: '/blog', label: 'BLOG' },
  { href: '/contact', label: 'CONTACT' },
] as const;

export type NavLink = (typeof navLinks)[number];

export const footerLinks = [
  { href: '/#about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
] as const;

export const socials = [
  {
    platform: 'GitHub',
    username: '@yukebrillianth',
    href: 'https://github.com/yukebrillianth',
    icon: '/icons/Github.svg',
  },
  {
    platform: 'Instagram',
    username: '@yukebrillianth',
    href: 'https://instagram.com/yukebrillianth',
    icon: '/icons/Instagram.svg',
  },
  {
    platform: 'LinkedIn',
    username: '@yukebrillianth',
    href: 'https://www.linkedin.com/in/yukebrillianth',
    icon: '/icons/LinkedIn.svg',
  },
  {
    platform: 'Telegram',
    username: '@yukebrillianth',
    href: 'https://t.me/yukebrillianth',
    icon: '/icons/Telegram.svg',
  },
  {
    platform: 'YouTube',
    username: '@yukebrillianth',
    href: 'https://www.youtube.com/channel/UCJ8ObQYEKKVS9TRhhST_7bg',
    icon: '/icons/YouTube.svg',
  },
  {
    platform: 'X',
    username: '@YukeBrillianth',
    href: 'https://x.com/YukeBrillianth',
    icon: '/icons/Twitter.svg',
  },
] as const;

export type Social = (typeof socials)[number];

export const email = 'yukebrillianth@gmail.com';

/** Shown as the tech row in the fun-fact section. */
export const coreStack = [
  { name: 'ROS', icon: '/icons/ros.svg' },
  { name: 'C++', icon: '/icons/cpp.svg' },
  { name: 'TypeScript', icon: '/icons/ts.svg' },
  { name: 'React', icon: '/icons/react.svg' },
  { name: 'Next.js', icon: '/icons/next.svg' },
  { name: 'Node.js', icon: '/icons/node.svg' },
  { name: 'Laravel', icon: '/icons/laravel.svg' },
  { name: 'GraphQL', icon: '/icons/gql.svg' },
] as const;

export const skillGroups = [
  {
    title: 'Robotics & Systems',
    items: [
      'ROS / ROS 1',
      'C++',
      'Autonomous robotics',
      'Multi-robot systems',
      'Distributed systems',
      'Real-time communication',
      'Computer networking',
      'UDP / TCP / WebSocket',
      'Linux',
      'OpenCV',
      'YOLO',
    ],
  },
  {
    title: 'Full Stack & Web',
    items: [
      'Laravel',
      'React.js',
      'React Native',
      'Next.js',
      'Nest.js',
      'Vue',
      'Node.js',
      'JavaScript',
      'TypeScript',
      'Go',
      'Tailwind CSS',
      'GraphQL',
      'PostgreSQL',
      'MySQL',
      'Figma',
    ],
  },
  {
    title: 'Engineering & Infrastructure',
    items: [
      'Docker',
      'CI/CD',
      'Server & network management',
      'Cloud inference',
    ],
  },
] as const;

export type SkillGroup = (typeof skillGroups)[number];

/**
 * Timeline entries for the education/experience section. Facts come from
 * docs/bio-context.md — do not add entries that are not documented there.
 */
export const timeline = [
  {
    role: 'Senior Software Engineer',
    org: 'IRIS ITS Robotic Team',
    period: 'Nov 2025 — Present',
    current: true,
  },
  {
    role: 'Head of Information Technology',
    org: 'PT. Alamanda Putra Mandiri',
    period: 'Jan 2025 — Present',
    current: true,
  },
  {
    role: 'Software Engineer',
    org: 'IRIS ITS Robotic Team',
    period: 'Nov 2024 — Nov 2025',
    current: false,
  },
  {
    role: 'Undergraduate, Computer Engineering',
    org: 'Institut Teknologi Sepuluh Nopember',
    period: '2024 — Present',
    current: true,
  },
] as const;

export type TimelineEntry = (typeof timeline)[number];

export const portfolioCategories = [
  { label: 'All', value: 'all' },
  { label: 'Website', value: 'Website' },
  { label: 'Mobile', value: 'Mobile' },
  { label: 'Robotics', value: 'Robotics' },
] as const;

/** ISR window for CMS reads — long, to stay inside free-tier quotas. */
export const REVALIDATE_SECONDS = 3_600;

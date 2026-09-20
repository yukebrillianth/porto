export const siteConfig = {
  name: 'Yuke Brilliant Hestiavin',
  shortName: 'yukebrillianth',
  title: 'Yuke Brilliant - Software Engineer, Robotics & Full Stack',
  description:
    'Software Engineer building across full-stack applications, distributed systems, and autonomous robotics. Undergraduate Computer Engineering at ITS Surabaya.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://yukebrillianth.my.id',
  ogImage: '/og-image.jpg',
  creator: 'Yuke Brilliant Hestiavin',
  locale: 'en_US',
  location: 'Surabaya / Sidoarjo, East Java, Indonesia',
  role: 'Software Engineer | Autonomous Robotics | Full Stack Developer',
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

/**
 * The tech row in the fun-fact section. These are the six the original site
 * showed as large bare logos - kept to Yuke's current working stack.
 */
export const coreStack = [
  { name: 'TypeScript', icon: '/icons/ts.svg' },
  { name: 'Next.js', icon: '/icons/nextjs.svg' },
  { name: 'Nest.js', icon: '/icons/nestjs.svg' },
  { name: 'C++', icon: '/icons/cpp.svg' },
  { name: 'ROS', icon: '/icons/ros.svg' },
  { name: 'PostgreSQL', icon: '/icons/pgsql.svg' },
  { name: 'Go', icon: '/icons/go.svg' },
  { name: 'Docker', icon: '/icons/docker.svg' },
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
 * The merged education + experience timeline, newest first. Facts come from
 * docs/bio-context.md - do not add entries that are not documented there.
 */
export const timeline = [
  {
    role: 'Senior Software Engineer',
    org: 'IRIS ITS Robotic Team',
    period: 'Nov 2025 - Present',
    kind: 'work',
    detail:
      'Distributed communication for autonomous soccer robots in RoboCup MSL - real-time networking over ROS, UDP and WebSocket, built to stay up on unstable competition Wi-Fi.',
    current: true,
  },
  {
    role: 'Head of Information Technology',
    org: 'PT. Alamanda Putra Mandiri',
    period: 'Jan 2025 - Present',
    kind: 'work',
    detail:
      'Led the internal Mini ERP in Laravel, a Next.js company profile, and SIMMA Sense - an RFID linen asset system for hospital clients. Also run the servers and network.',
    current: true,
  },
  {
    role: 'Undergraduate, Computer Engineering',
    org: 'Institut Teknologi Sepuluh Nopember',
    period: '2024 - Present',
    kind: 'education',
    detail: 'Surabaya, East Java.',
    current: true,
  },
  {
    role: 'Software Engineer',
    org: 'IRIS ITS Robotic Team',
    period: 'Nov 2024 - Nov 2025',
    kind: 'work',
    detail:
      'MSL robot software on ROS 1, Base Station in React and Vue, a RefBox over TCP, OpenCV in C++, and YOLO cloud inference for educational robots.',
    current: false,
  },
  {
    role: 'Staff, Frontend IT Development',
    org: 'Ini Lho ITS!',
    period: 'Oct 2024 - Mar 2025',
    kind: 'work',
    detail:
      'Built the 2025 site frontend in Next.js and Tailwind, implementing Figma designs to spec.',
    current: false,
  },
  {
    role: 'SMAN 1 Taman Sidoarjo',
    org: 'Head of Programming, ICTC',
    period: '2022 - 2023',
    kind: 'education',
    detail:
      'Where it started: built UpVote, a real-time voting app for school competitions, and ran broadcast for school events.',
    current: false,
  },
] as const;

export type TimelineEntry = (typeof timeline)[number];

export const portfolioCategories = [
  { label: 'All', value: 'all' },
  { label: 'Website', value: 'Website' },
  { label: 'Mobile', value: 'Mobile' },
  { label: 'Robotics', value: 'Robotics' },
] as const;

/** ISR window for CMS reads - long, to stay inside free-tier quotas. */
export const REVALIDATE_SECONDS = 3_600;

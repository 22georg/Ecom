export const siteConfig = {
  name: 'MARQIVO',
  tagline: 'Modern commerce, intelligently connected.',
  description:
    'An original, production-grade commerce platform designed around Discovery, Decision, Purchase, and Management.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  links: {
    docs: '/docs',
    github: 'https://github.com',
  },
  contact: {
    supportEmail: 'support@marqivo.local',
  },
  currency: {
    code: 'USD',
    symbol: '$',
    format: 'en-US',
  },
};

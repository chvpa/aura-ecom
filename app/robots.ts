import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/cuenta/',
          '/checkout/',
          '/confirmacion/',
          '/onboarding/',
          '/login',
          '/register',
          '/reset-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/cuenta/',
          '/checkout/',
          '/confirmacion/',
          '/onboarding/',
          '/login',
          '/register',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}


import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://carriey.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/profil/', '/parametres/', '/mes-documents/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

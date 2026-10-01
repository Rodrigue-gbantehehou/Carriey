import config from '@/lib/config';

/**
 * Builds the full URL for a photo stored on the backend.
 * The DB stores paths like /static/photos/xxx.jpg
 * In development, we proxy /backend-static/* → http://localhost:8000/static/*
 * so the browser never calls port 8000 directly (no CORS).
 */
export function getPhotoUrl(photo_url?: string | null): string | null {
  if (!photo_url) return null;
  // Already a full URL (blob:, data:, https://, http://)
  if (photo_url.startsWith('http') || photo_url.startsWith('blob:') || photo_url.startsWith('data:')) {
    return photo_url;
  }
  // Use the centralized staticBaseUrl if in production
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_API_URL) {
    return `${config.staticBaseUrl}${photo_url.replace('/static', '')}`;
  }
  // In development: proxy static files through Next.js to avoid CORS
  // /static/photos/xxx.jpg → /backend-static/photos/xxx.jpg
  const proxied = photo_url.replace(/^\/static\//, '/backend-static/');
  return proxied;
}

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
  
  // If it's an API route for the photo
  if (photo_url.startsWith('/api/')) {
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_API_URL) {
      // e.g. photo_url is /api/v1/profile/photo/...
      // config.apiBaseUrl is typically the full backend URL + /api or just /api.
      // But actually process.env.NEXT_PUBLIC_API_URL is the full backend api url.
      // Easiest is to replace /api with the backend API URL.
      if (process.env.NEXT_PUBLIC_API_URL) {
        return photo_url.replace(/^\/api/, process.env.NEXT_PUBLIC_API_URL);
      }
      return `${config.backendUrl}${photo_url}`;
    }
    // In dev, the Next.js rewrite will handle /api/
    return photo_url;
  }

  // Legacy static files
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_API_URL) {
    return `${config.staticBaseUrl}${photo_url.replace('/static', '')}`;
  }
  // In development: proxy static files through Next.js to avoid CORS
  // /static/photos/xxx.jpg → /backend-static/photos/xxx.jpg
  const proxied = photo_url.replace(/^\/static\//, '/backend-static/');
  return proxied;
}

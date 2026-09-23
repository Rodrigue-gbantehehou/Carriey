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
  // In production, NEXT_PUBLIC_API_URL contains the full backend base (e.g. https://api.myapp.com/api/v1)
  if (process.env.NEXT_PUBLIC_API_URL) {
    const backendBase = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '');
    return `${backendBase}${photo_url}`;
  }
  // In development: proxy static files through Next.js to avoid CORS
  // /static/photos/xxx.jpg → /backend-static/photos/xxx.jpg
  const proxied = photo_url.replace(/^\/static\//, '/backend-static/');
  return proxied;
}

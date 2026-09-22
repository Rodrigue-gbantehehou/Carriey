/**
 * Builds the full URL for a photo stored on the backend.
 * The DB stores paths like /static/photos/xxx.jpg
 * This converts them to http://localhost:8000/static/photos/xxx.jpg
 */
export function getPhotoUrl(photo_url?: string | null): string | null {
  if (!photo_url) return null;
  // Already a full URL (blob:, data:, https://, http://)
  if (photo_url.startsWith('http') || photo_url.startsWith('blob:') || photo_url.startsWith('data:')) {
    return photo_url;
  }
  // Relative path from backend static files
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const backendBase = apiBase.replace('/api/v1', '');
  return `${backendBase}${photo_url}`;
}

/**
 * Resolves relative URLs for GitHub Pages compatibility and Games folder games.
 * Supports:
 * - External URLs (https://...)
 * - Games folder paths (Games/mygame.html or games/slope.html)
 * - Raw HTML filenames (mygame.html -> auto-prefixed with Games/)
 */
export function resolveGameUrl(url) {
  if (!url) return '';
  // If external URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Remove leading slash if present
  let cleanPath = url.startsWith('/') ? url.slice(1) : url;
  
  // If only a filename was provided (e.g. 'subwaysurfers.html'), prefix with Games/
  if (!cleanPath.toLowerCase().startsWith('games/')) {
    cleanPath = `Games/${cleanPath}`;
  }

  const baseUrl = import.meta.env.BASE_URL || './';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
}

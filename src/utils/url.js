/**
 * Resolves relative URLs for GitHub Pages compatibility
 * Supports standalone full URLs (https://...) and relative paths (games/slope.html)
 */
export function resolveGameUrl(url) {
  if (!url) return '';
  // If external URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Remove leading slash if present
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  const baseUrl = import.meta.env.BASE_URL || './';
  
  // Ensure baseUrl ends with slash
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
}

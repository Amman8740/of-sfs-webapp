/**
 * Convert any image URL to a weserv.nl proxied URL for reliable loading
 * @param originalUrl - The original image URL
 * @param options - Optional weserv.nl parameters
 * @returns The proxied URL
 */
export function getProxiedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpg' | 'png' | 'webp';
  } = {}
): string {
  if (!originalUrl) return '';

  // Encode the original URL
  const encodedUrl = encodeURIComponent(originalUrl);

  // Build weserv.nl URL with parameters
  const params = new URLSearchParams();
  params.set('url', encodedUrl);

  // Add optional parameters
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('output', options.format);

  return `https://images.weserv.nl/?${params.toString()}`;
}

/**
 * Check if a URL is from OnlyFans
 */
export function isOnlyFansUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('onlyfans.com') ||
           urlObj.hostname.includes('thumbs.onlyfans.com');
  } catch {
    return false;
  }
}

/**
 * Get optimized proxy settings for OnlyFans images
 */
export function getOnlyFansProxyOptions() {
  return {
    width: 400,
    height: 400,
    quality: 85,
    format: 'webp' as const
  };
}
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/proxy-image - Proxy images from external URLs to bypass CORS
 *
 * Query parameters:
 * - url: The external image URL to proxy
 * - userId: Optional user ID for rate limiting and caching
 *
 * Headers sent to external URL:
 * - User-Agent: Browser-like user agent
 * - Referer: https://onlyfans.com/ (to bypass restrictions)
 * - Accept: image/webp,image/apng,image/,,q=0.8
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const userId = searchParams.get('userId');

    // Validate required parameters
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing required parameter: url' },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Rate limiting check (basic implementation)
    if (userId) {
      // You can implement more sophisticated rate limiting here
      // For now, we'll just log the request
      console.log(`Image proxy request for user ${userId}: ${imageUrl}`);
    }

    // Set up headers to mimic a real browser request
    const headers = new Headers();
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    headers.set('Referer', 'https://onlyfans.com/');
    headers.set('Accept', 'image/webp,image/apng,image/*,*/*;q=0.8');
    headers.set('Accept-Language', 'en-US,en;q=0.9');
    headers.set('Accept-Encoding', 'gzip, deflate, br');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Pragma', 'no-cache');

    // Add authorization headers if needed (for authenticated requests)
    // headers.set('Authorization', 'Bearer your-token-here');

    // Fetch the image from the external URL
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers,
      // Set a reasonable timeout
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response as array buffer (binary data)
    const imageBuffer = await response.arrayBuffer();

    // Get content type from response headers
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Create response with the image data
    const imageResponse = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

    return imageResponse;

  } catch (error: any) {
    console.error('Image proxy error:', error);

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
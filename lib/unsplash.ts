// ============================================================
// Canvo — Unsplash API Client
// ============================================================

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: { html: string };
  };
  width: number;
  height: number;
}

export interface UnsplashSearchResult {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';

/**
 * Search Unsplash for photos, or fetch editorial photos if no query.
 */
export async function searchPhotos(
  query: string,
  page = 1,
  perPage = 20
): Promise<{ photos: UnsplashPhoto[]; totalPages: number }> {
  if (!UNSPLASH_ACCESS_KEY) {
    return { photos: [], totalPages: 0 };
  }

  const endpoint = query
    ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
    : `https://api.unsplash.com/photos?page=${page}&per_page=${perPage}&order_by=popular`;

  const res = await fetch(endpoint, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });

  if (!res.ok) {
    console.error('Unsplash API error:', res.status);
    return { photos: [], totalPages: 0 };
  }

  if (query) {
    const data: UnsplashSearchResult = await res.json();
    return { photos: data.results, totalPages: data.total_pages };
  } else {
    const data: UnsplashPhoto[] = await res.json();
    return { photos: data, totalPages: 100 }; // editorial has many pages
  }
}

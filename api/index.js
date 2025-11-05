import MetAPI from './MET';
import Chicago from './Chicago';

// Filters out items that do not contain a usable image URL
function filterItemsWithImages(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((it) => {
    const url = it && it.imageURL;
    if (!url || typeof url !== 'string') return false;
    const s = url.trim();
    if (!s) return false;
    // Basic sanity check: should look like a URL
    return /^https?:\/\//i.test(s);
  });
}

// Fisher-Yates shuffle algorithm for randomizing array
function shuffleArray(array) {
  const arr = [...array]; // Create a copy to avoid mutating original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class API {
  constructor(cacheTTL = 5 * 60 * 1000) {
    // Cache TTL: 5 minutes (300000 ms) by default
    this.cacheTTL = cacheTTL;
    this.apis = [
      new MetAPI('https://collectionapi.metmuseum.org', cacheTTL),
      new Chicago(cacheTTL),
    ];
  }

  async search(searchTerm, options = {}) {
    const { shuffle = true } = options;
    
    const perSource = await Promise.all(
      this.apis.map(async (api) => {
        try {
          const items = await api.search(searchTerm);
          return Array.isArray(items)
            ? items.map((it) => ({ ...it, source: api.name }))
            : [];
        } catch (e) {
          console.log("Error: ", e);
          console.log(`Failed to fetch results from ${api.name}`);
          return [];
        }
      })
    );
    
    // Shuffle each source's results if requested to provide variety
    const lists = shuffle 
      ? perSource.map(arr => shuffleArray(arr))
      : perSource.map(arr => [...arr]);
    
    // Interleave results round-robin with a random starting index
    const total = lists.reduce((acc, arr) => acc + arr.length, 0);
    const out = [];
    let i = Math.floor(Math.random() * (lists.length || 1));
    while (out.length < total) {
      const list = lists[i % lists.length];
      if (list.length) out.push(list.shift());
      i++;
    }
    
    // Filter out items without images
    const withImages = filterItemsWithImages(out);

    // Strip HTML from text fields across items
    const stripHtml = (s) => typeof s === 'string' ? s.replace(/<[^>]*>/g, '') : s;
    const cleaned = withImages.map((it) => ({
      ...it,
      title: stripHtml(it.title),
      artist: stripHtml(it.artist),
      description: stripHtml(it.description),
      department: stripHtml(it.department),
      style: stripHtml(it.style),
      source: stripHtml(it.source),
    }));
    return cleaned;
  }
  
  /**
   * Clear all caches across all APIs
   */
  clearCaches() {
    this.apis.forEach(api => {
      if (typeof api.clearCache === 'function') {
        api.clearCache();
      }
    });
  }
}
const api = new API();
export default api;
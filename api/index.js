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

// TODO: internal caching of results and method of returning cached results results in redundant searches and stale content.
class API {
  constructor() {
    this.apis = [
      new MetAPI('https://collectionapi.metmuseum.org'),
      new Chicago(),
    ];
  }

  async search(searchTerm) {
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
    // Interleave results round-robin with a random starting index
    const lists = perSource.map(arr => [...arr]);
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
}
const api = new API();
export default api;